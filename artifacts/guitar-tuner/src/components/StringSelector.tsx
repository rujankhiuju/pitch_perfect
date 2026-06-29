import React from 'react';
import { Preset } from '../lib/pitchUtils';

interface StringSelectorProps {
  preset: Preset;
  targetMidi: number | undefined;
  onSelectTarget: (midi: number | undefined) => void;
}

export default function StringSelector({ preset, targetMidi, onSelectTarget }: StringSelectorProps) {
  if (preset.isChromatic || preset.strings.length === 0) {
    return <div className="h-16" />; // Placeholder to maintain layout
  }

  return (
    <div className="flex flex-col items-center gap-2 my-6">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Target String
      </span>
      <div className="flex gap-3 flex-wrap justify-center">
        {preset.strings.map((str, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTarget(str.midi === targetMidi ? undefined : str.midi)}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all ${
              targetMidi === str.midi
                ? 'bg-primary/20 border-primary text-primary scale-110 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                : 'bg-card border-card-border text-muted-foreground hover:border-muted hover:text-foreground'
            }`}
            data-testid={`string-${str.label}`}
          >
            <span className="font-bold text-lg leading-none">{str.name}</span>
            <span className="text-[10px] leading-none mt-1 opacity-70">{str.label.replace(str.name, '')}</span>
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground mt-2">
        {targetMidi ? 'Click again to unlock' : 'Click a string to lock target'}
      </span>
    </div>
  );
}
