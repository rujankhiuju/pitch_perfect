import React from 'react';
import { PitchData } from '../lib/pitchUtils';

interface NoteDisplayProps {
  pitchData: PitchData | null;
  stringLabel?: string;
}

export default function NoteDisplay({ pitchData, stringLabel }: NoteDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center my-8 select-none">
      <div className="relative flex items-end">
        {pitchData ? (
          <>
            <span className="text-8xl font-bold tracking-tighter text-white">
              {pitchData.note}
            </span>
            <span className="text-4xl text-muted-foreground font-semibold mb-2 ml-1">
              {pitchData.octave}
            </span>
          </>
        ) : (
          <span className="text-8xl font-bold tracking-tighter text-muted-foreground opacity-50 animate-pulse">
            —
          </span>
        )}
      </div>

      <div className="h-8 mt-2 flex items-center space-x-4 text-muted-foreground font-mono">
        {pitchData ? (
          <>
            <span className="w-24 text-right">{pitchData.freq.toFixed(1)} Hz</span>
            <span className="w-24 text-left">
              {pitchData.cents > 0 ? '+' : ''}{pitchData.cents}¢
            </span>
          </>
        ) : (
          <span className="text-sm">Waiting for signal...</span>
        )}
      </div>

      {stringLabel && (
        <div className="mt-4 px-4 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-semibold tracking-wider">
          Target: {stringLabel}
        </div>
      )}
    </div>
  );
}
