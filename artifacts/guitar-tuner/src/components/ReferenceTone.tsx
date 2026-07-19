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
        className={`min-h-[44px] min-w-[44px] flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
          isPlaying
            ? 'bg-warning/20 text-warning border-2 border-warning/60 shadow-[0_0_20px_rgba(214,160,67,0.4)]'
            : 'bg-card text-card-foreground border border-card-border hover:bg-accent hover:text-foreground active:scale-95'
        }`}
        data-testid="button-reference-tone"
      >
        {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isPlaying ? 'Stop Tone' : 'Play Reference Tone'}
      </button>
    </div>
  );
}
