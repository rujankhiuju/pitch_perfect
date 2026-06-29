import React, { useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { useReferenceTone } from '../hooks/useReferenceTone';
import { getFrequencyFromMidi } from '../lib/pitchUtils';

interface ReferenceToneProps {
  targetMidi?: number;
  a4: number;
  volume: number;
}

export default function ReferenceTone({ targetMidi, a4, volume }: ReferenceToneProps) {
  const { isPlaying, playTone, stopTone } = useReferenceTone();

  // Stop if target changes
  useEffect(() => {
    stopTone();
  }, [targetMidi, stopTone]);

  if (!targetMidi) return <div className="h-12" />;

  const freq = getFrequencyFromMidi(targetMidi, a4);

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <button
        onClick={() => isPlaying ? stopTone() : playTone(freq, volume)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
          isPlaying 
            ? 'bg-warning/20 text-warning border border-warning/50 animate-pulse'
            : 'bg-card text-card-foreground border border-card-border hover:bg-accent'
        }`}
        data-testid="button-reference-tone"
      >
        {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isPlaying ? 'Stop Tone' : 'Play Reference Tone'}
      </button>
    </div>
  );
}
