import React from 'react';
import { PitchData } from '../lib/pitchUtils';

interface NoteDisplayProps {
  pitchData: PitchData | null;
  stringLabel?: string;
}

export default function NoteDisplay({ pitchData, stringLabel }: NoteDisplayProps) {
  const absCents = pitchData ? Math.abs(pitchData.cents) : 0;
  const centsColor = pitchData
    ? absCents <= 10
      ? 'var(--color-success)'
      : absCents <= 30
      ? 'var(--color-warning)'
      : 'var(--color-destructive)'
    : 'var(--color-muted-foreground)';

  return (
    <div className="flex flex-col items-center justify-center my-6 select-none">
      <div className="relative flex items-end">
        {pitchData ? (
          <>
            <span className="text-9xl font-black tracking-tight text-foreground leading-none">
              {pitchData.note}
            </span>
            <span className="text-4xl text-muted-foreground font-semibold mb-1 ml-1">
              {pitchData.octave}
            </span>
          </>
        ) : (
          <span className="text-9xl font-black tracking-tight text-muted-foreground/30 leading-none">
            —
          </span>
        )}
      </div>

      <div className="h-8 mt-3 flex items-center justify-center gap-6 text-muted-foreground font-mono">
        {pitchData ? (
          <>
            <span className="text-lg">{pitchData.freq.toFixed(1)} Hz</span>
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: centsColor }}
            >
              {pitchData.cents > 0 ? '+' : ''}{pitchData.cents}¢
            </span>
          </>
        ) : (
          <span className="text-sm opacity-0">_</span>
        )}
      </div>

      {stringLabel && (
        <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/15 text-primary-foreground border border-primary/20 text-sm font-semibold tracking-wider">
          Target: {stringLabel}
        </div>
      )}
    </div>
  );
}
