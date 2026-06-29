import React from 'react';
import { Preset, PRESETS } from '../lib/pitchUtils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface TuningPresetsProps {
  activePreset: Preset;
  onSelect: (preset: Preset) => void;
}

export default function TuningPresets({ activePreset, onSelect }: TuningPresetsProps) {
  return (
    <div className="w-full relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelect(preset)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activePreset.id === preset.id
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'bg-card text-card-foreground border border-card-border hover:bg-accent'
              }`}
              data-testid={`preset-${preset.id}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
