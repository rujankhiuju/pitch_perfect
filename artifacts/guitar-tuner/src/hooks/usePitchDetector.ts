import { useState, useEffect, useRef, useCallback } from 'react';
import { freqToNote, PitchData, getFrequencyFromMidi } from '../lib/pitchUtils';

function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const size = buffer.length;
  // Apply Hamming window
  for (let i = 0; i < size; i++) {
    buffer[i] *= 0.54 - 0.46 * Math.cos(2 * Math.PI * i / size);
  }
  // Autocorrelation
  const correlation = new Float32Array(size);
  for (let lag = 0; lag < size; lag++) {
    for (let i = 0; i < size - lag; i++) {
      correlation[lag] += buffer[i] * buffer[i + lag];
    }
  }
  // Find first peak after initial dip
  let maxCorr = -Infinity;
  let minCorr = Infinity;
  let minCorrPos = -1;
  for (let i = 1; i < size; i++) {
    if (correlation[i] < minCorr) { minCorr = correlation[i]; minCorrPos = i; }
  }
  let maxCorrPos = minCorrPos;
  for (let i = minCorrPos; i < size; i++) {
    if (correlation[i] > maxCorr) { maxCorr = correlation[i]; maxCorrPos = i; }
  }
  if (maxCorr < 0.01 * correlation[0]) return null; // not enough signal
  
  const y1 = correlation[maxCorrPos - 1] ?? 0;
  const y2 = correlation[maxCorrPos];
  const y3 = correlation[maxCorrPos + 1] ?? 0;
  const peak = maxCorrPos - (y3 - y1) / (2 * (2 * y2 - y1 - y3));
  return sampleRate / peak;
}

export function usePitchDetector(a4: number, smoothing: number, targetMidi?: number) {
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafId = useRef<number | null>(null);
  
  const smoothedFreq = useRef<number | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      setError(null);
      smoothedFreq.current = null;
      
      const buffer = new Float32Array(analyserRef.current.fftSize);
      const sampleRate = audioCtxRef.current.sampleRate;
      
      const updatePitch = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);
        
        let freq = detectPitch(buffer, sampleRate);
        
        if (freq && freq > 20 && freq < 2000) {
          if (smoothedFreq.current === null) {
            smoothedFreq.current = freq;
          } else {
            smoothedFreq.current = smoothedFreq.current * smoothing + freq * (1 - smoothing);
          }
          
          let result = freqToNote(smoothedFreq.current, a4);
          
          if (targetMidi !== undefined) {
             const targetFreq = getFrequencyFromMidi(targetMidi, a4);
             const cents = 1200 * Math.log2(smoothedFreq.current / targetFreq);
             result = { ...result, midiNum: targetMidi, cents: Math.max(-50, Math.min(50, Math.round(cents))) };
          }

          setPitchData(result);
        } else {
          setPitchData(null);
        }
        
        rafId.current = requestAnimationFrame(updatePitch);
      };
      
      updatePitch();
    } catch (err: any) {
      console.error(err);
      setError("Microphone access denied or not supported. Please allow microphone access to use the tuner.");
      setIsListening(false);
    }
  }, [a4, smoothing, targetMidi]);

  const stop = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    
    setIsListening(false);
    setPitchData(null);
  }, []);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { pitchData, isListening, error, start, stop };
}
