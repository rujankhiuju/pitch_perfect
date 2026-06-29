import { useState, useEffect, useRef, useCallback } from 'react';
import { freqToNote, PitchData, getFrequencyFromMidi } from '../lib/pitchUtils';

// Minimum RMS signal level to attempt pitch detection.
// Below this we treat it as silence/noise and output nothing.
const NOISE_GATE = 0.015;

// Autocorrelation confidence: ratio of best lag peak to lag-0 energy.
// 0.1 is much stricter than the old 0.01.
const CONFIDENCE_THRESHOLD = 0.1;

// How many consecutive frames must agree on the same MIDI note
// before we update the display. Eliminates transient blips.
const STABILITY_FRAMES = 4;

// How many silent frames before we clear the display (hold the last
// good reading briefly so the display doesn't flicker on/off).
const SILENCE_HOLDOFF_FRAMES = 20;

function getRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const size = buffer.length;

  // Apply Hamming window
  const windowed = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    windowed[i] = buffer[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / size));
  }

  // Compute autocorrelation only up to half the buffer
  // (frequencies down to ~43 Hz at 44100 / 1024)
  const halfSize = Math.floor(size / 2);
  const correlation = new Float32Array(halfSize);
  for (let lag = 0; lag < halfSize; lag++) {
    let sum = 0;
    for (let i = 0; i < size - lag; i++) {
      sum += windowed[i] * windowed[i + lag];
    }
    correlation[lag] = sum;
  }

  // Find first local minimum after lag 0 (where the correlation dips)
  let minPos = 1;
  while (minPos < halfSize - 1 && correlation[minPos + 1] < correlation[minPos]) {
    minPos++;
  }

  // Find the strongest peak after the first dip
  let maxCorr = -Infinity;
  let maxCorrPos = -1;
  for (let i = minPos; i < halfSize; i++) {
    if (correlation[i] > maxCorr) {
      maxCorr = correlation[i];
      maxCorrPos = i;
    }
  }

  if (maxCorrPos === -1) return null;

  // Reject weak correlations relative to lag-0 energy
  if (maxCorr < CONFIDENCE_THRESHOLD * correlation[0]) return null;

  // Parabolic interpolation for sub-sample accuracy
  const y1 = correlation[maxCorrPos - 1] ?? 0;
  const y2 = correlation[maxCorrPos];
  const y3 = correlation[maxCorrPos + 1] ?? 0;
  const denom = 2 * y2 - y1 - y3;
  const refinedPeak = denom === 0 ? maxCorrPos : maxCorrPos - (y3 - y1) / (2 * denom);

  if (refinedPeak <= 0) return null;
  return sampleRate / refinedPeak;
}

export function usePitchDetector(a4: number, smoothing: number, targetMidi?: number) {
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafId = useRef<number | null>(null);

  // Smoothed frequency (exponential moving average)
  const smoothedFreq = useRef<number | null>(null);
  // Stability buffer: last N midi note numbers
  const noteHistory = useRef<number[]>([]);
  // Frames with no valid pitch (for holdoff)
  const silenceFrames = useRef(0);
  // Throttle: only update display every N animation frames
  const frameCount = useRef(0);
  const DISPLAY_EVERY = 3; // ~20fps display updates at 60fps RAF

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096; // larger = better low-freq resolution

      sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      setIsListening(true);
      setError(null);
      smoothedFreq.current = null;
      noteHistory.current = [];
      silenceFrames.current = 0;
      frameCount.current = 0;

      const buffer = new Float32Array(analyserRef.current.fftSize);
      const sampleRate = audioCtxRef.current.sampleRate;

      const updatePitch = () => {
        if (!analyserRef.current) return;
        rafId.current = requestAnimationFrame(updatePitch);

        frameCount.current++;
        if (frameCount.current % DISPLAY_EVERY !== 0) return;

        analyserRef.current.getFloatTimeDomainData(buffer);

        // --- Noise gate: bail early if signal is too quiet ---
        const rms = getRMS(buffer);
        if (rms < NOISE_GATE) {
          silenceFrames.current++;
          if (silenceFrames.current >= SILENCE_HOLDOFF_FRAMES) {
            smoothedFreq.current = null;
            noteHistory.current = [];
            setPitchData(null);
          }
          return;
        }
        silenceFrames.current = 0;

        // --- Pitch detection ---
        const freq = detectPitch(buffer, sampleRate);
        if (!freq || freq < 27.5 || freq > 1400) {
          // Out of guitar range — treat as no signal
          silenceFrames.current++;
          if (silenceFrames.current >= SILENCE_HOLDOFF_FRAMES) {
            smoothedFreq.current = null;
            noteHistory.current = [];
            setPitchData(null);
          }
          return;
        }
        silenceFrames.current = 0;

        // --- Smooth the frequency ---
        if (smoothedFreq.current === null) {
          smoothedFreq.current = freq;
        } else {
          smoothedFreq.current = smoothedFreq.current * smoothing + freq * (1 - smoothing);
        }

        // --- Stability filter: require same MIDI note N frames in a row ---
        const rawNote = freqToNote(freq, a4);
        noteHistory.current = [...noteHistory.current.slice(-(STABILITY_FRAMES - 1)), rawNote.midiNum];

        // All frames in history must agree on the same MIDI note
        const allSame = noteHistory.current.length === STABILITY_FRAMES &&
          noteHistory.current.every(n => n === noteHistory.current[0]);

        if (!allSame) return; // still building consensus — don't update display

        // --- Build final result from smoothed frequency ---
        let result = freqToNote(smoothedFreq.current, a4);

        if (targetMidi !== undefined) {
          const targetFreq = getFrequencyFromMidi(targetMidi, a4);
          const cents = 1200 * Math.log2(smoothedFreq.current / targetFreq);
          result = {
            ...result,
            cents: Math.max(-50, Math.min(50, Math.round(cents))),
          };
        }

        setPitchData(result);
      };

      updatePitch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
        setError('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
      } else if (msg.includes('NotFound') || msg.includes('Devices')) {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Could not access microphone. Please check your browser settings.');
      }
      setIsListening(false);
    }
  }, [a4, smoothing, targetMidi]);

  const stop = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    smoothedFreq.current = null;
    noteHistory.current = [];
    setIsListening(false);
    setPitchData(null);
  }, []);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { pitchData, isListening, error, start, stop };
}
