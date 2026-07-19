import React from 'react';
import { Preset, PitchData } from '../lib/pitchUtils';

interface StringSelectorProps {
  preset: Preset;
  targetMidi: number | undefined;
  onSelectTarget: (midi: number | undefined) => void;
  pitchData: PitchData | null;
}

export default function StringSelector({ preset, targetMidi, onSelectTarget, pitchData }: StringSelectorProps) {
  if (preset.isChromatic || preset.strings.length === 0) {
    return <div className="h-16" />; // Placeholder to maintain layout
  }

  // Auto-detect which string is closest to the currently detected pitch
  const closestMidi = pitchData
    ? preset.strings.reduce((best, str) =>
        Math.abs(str.midi - pitchData.midiNum) < Math.abs(best.midi - pitchData.midiNum)
          ? str
          : best
      ).midi
    : undefined;

  return (
    <div className="flex flex-col items-center gap-2 my-6">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Target String
      </span>
      <div className="flex gap-3 flex-wrap justify-center">
        {preset.strings.map((str, idx) => {
          const isManual = targetMidi === str.midi;
          const isClosest = closestMidi === str.midi && targetMidi === undefined;
          const isActive = isManual || isClosest;
          return (
            <button
              key={idx}
              onClick={() => onSelectTarget(str.midi === targetMidi ? undefined : str.midi)}
              className={`min-w-[44px] min-h-[44px] w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-150 ${
                isManual
                  ? 'bg-primary/20 border-primary text-primary-foreground scale-110 shadow-[0_0_16px_rgba(125,116,105,0.35)]'
                  : isClosest
                  ? 'bg-primary/10 border-primary/40 text-primary-foreground/80'
                  : 'bg-card border-card-border text-muted-foreground hover:border-muted hover:text-foreground'
              }`}
              data-testid={`string-${str.label}`}
            >
              <span className="font-bold text-lg leading-none">{str.name}</span>
              <span className="text-[10px] leading-none mt-1 opacity-70">{str.label.replace(str.name, '')}</span>
            </button>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground mt-2">
        {targetMidi ? 'Click again to unlock' : 'Click a string to lock target'}
      </span>
    </div>
  );
}
