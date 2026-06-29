export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export interface PitchData {
  note: string;
  octave: number;
  cents: number;
  midiNum: number;
  freq: number;
}

export function freqToNote(freq: number, a4: number = 440): PitchData {
  const midiNum = 12 * Math.log2(freq / a4) + 69;
  const rounded = Math.round(midiNum);
  const cents = Math.round((midiNum - rounded) * 100);
  const noteName = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return { note: noteName, octave, cents, midiNum: rounded, freq };
}

export interface Preset {
  id: string;
  name: string;
  isChromatic?: boolean;
  strings: { label: string; midi: number; name: string }[];
}

export const PRESETS: Preset[] = [
  {
    id: 'chromatic',
    name: 'Chromatic',
    isChromatic: true,
    strings: []
  },
  {
    id: 'standard-e',
    name: 'Standard E',
    strings: [
      { label: 'E2', midi: 40, name: 'E' },
      { label: 'A2', midi: 45, name: 'A' },
      { label: 'D3', midi: 50, name: 'D' },
      { label: 'G3', midi: 55, name: 'G' },
      { label: 'B3', midi: 59, name: 'B' },
      { label: 'E4', midi: 64, name: 'E' }
    ]
  },
  {
    id: 'drop-d',
    name: 'Drop D',
    strings: [
      { label: 'D2', midi: 38, name: 'D' },
      { label: 'A2', midi: 45, name: 'A' },
      { label: 'D3', midi: 50, name: 'D' },
      { label: 'G3', midi: 55, name: 'G' },
      { label: 'B3', midi: 59, name: 'B' },
      { label: 'E4', midi: 64, name: 'E' }
    ]
  },
  {
    id: 'open-g',
    name: 'Open G',
    strings: [
      { label: 'D2', midi: 38, name: 'D' },
      { label: 'G2', midi: 43, name: 'G' },
      { label: 'D3', midi: 50, name: 'D' },
      { label: 'G3', midi: 55, name: 'G' },
      { label: 'B3', midi: 59, name: 'B' },
      { label: 'D4', midi: 62, name: 'D' }
    ]
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    strings: [
      { label: 'D2', midi: 38, name: 'D' },
      { label: 'A2', midi: 45, name: 'A' },
      { label: 'D3', midi: 50, name: 'D' },
      { label: 'G3', midi: 55, name: 'G' },
      { label: 'A3', midi: 57, name: 'A' },
      { label: 'D4', midi: 62, name: 'D' }
    ]
  },
  {
    id: 'half-step-down',
    name: 'Half-step Down (Eb)',
    strings: [
      { label: 'Eb2', midi: 39, name: 'D#' },
      { label: 'Ab2', midi: 44, name: 'G#' },
      { label: 'Db3', midi: 49, name: 'C#' },
      { label: 'Gb3', midi: 54, name: 'F#' },
      { label: 'Bb3', midi: 58, name: 'A#' },
      { label: 'Eb4', midi: 63, name: 'D#' }
    ]
  },
  {
    id: '7-string-standard',
    name: '7-string Standard',
    strings: [
      { label: 'B1', midi: 35, name: 'B' },
      { label: 'E2', midi: 40, name: 'E' },
      { label: 'A2', midi: 45, name: 'A' },
      { label: 'D3', midi: 50, name: 'D' },
      { label: 'G3', midi: 55, name: 'G' },
      { label: 'B3', midi: 59, name: 'B' },
      { label: 'E4', midi: 64, name: 'E' }
    ]
  }
];

export function getFrequencyFromMidi(midi: number, a4: number = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12);
}
