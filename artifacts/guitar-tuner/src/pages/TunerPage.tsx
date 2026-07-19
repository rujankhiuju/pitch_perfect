import React, { useState } from 'react';
import { PRESETS } from '../lib/pitchUtils';
import { usePitchDetector } from '../hooks/usePitchDetector';
import TunerGauge from '../components/TunerGauge';
import NoteDisplay from '../components/NoteDisplay';
import TuningPresets from '../components/TuningPresets';
import StringSelector from '../components/StringSelector';
import ReferenceTone from '../components/ReferenceTone';
import MicButton from '../components/MicButton';
import SettingsPanel from '../components/SettingsPanel';

export default function TunerPage() {
  const [a4, setA4] = useState(440);
  const [smoothing, setSmoothing] = useState(0.8);
  const [volume, setVolume] = useState(0.5);
  
  const [activePreset, setActivePreset] = useState(PRESETS[1]); // Default Standard E
  const [targetMidi, setTargetMidi] = useState<number | undefined>(undefined);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { pitchData, isListening, error, start, stop } = usePitchDetector(a4, smoothing, targetMidi);

  // Auto-select string label if locked
  const targetLabel = targetMidi 
    ? activePreset.strings.find(s => s.midi === targetMidi)?.label
    : undefined;

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center pt-4 pb-2 safe-area-padding">
      {/* Top Presets Navigation */}
      <div className="w-full max-w-2xl px-4 pt-[env(safe-area-inset-top,0px)]">
        <TuningPresets 
          activePreset={activePreset} 
          onSelect={(preset) => {
            setActivePreset(preset);
            setTargetMidi(undefined); // Reset lock on preset change
          }} 
        />
      </div>

      <div className="flex-1 w-full max-w-2xl flex flex-col justify-center px-6 mt-4">
        <NoteDisplay pitchData={pitchData} stringLabel={targetLabel} />
        
        <div className="my-8">
          <TunerGauge cents={pitchData?.cents ?? null} />
        </div>

        <StringSelector 
          preset={activePreset} 
          targetMidi={targetMidi} 
          onSelectTarget={setTargetMidi}
          pitchData={pitchData}
        />

        <ReferenceTone 
          targetMidi={targetMidi} 
          a4={a4} 
          volume={volume} 
        />
      </div>

      {/* Empty state hint when listening but no note detected */}
      {isListening && !pitchData && (
        <div className="fixed inset-x-0 top-1/3 flex justify-center pointer-events-none z-10">
          <span className="text-muted-foreground/60 text-lg font-semibold tracking-wide animate-pulse">
            Play a string to begin
          </span>
        </div>
      )}

      <MicButton 
        isListening={isListening} 
        onStart={start} 
        onStop={stop} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        error={error}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        a4={a4}
        setA4={setA4}
        smoothing={smoothing}
        setSmoothing={setSmoothing}
        volume={volume}
        setVolume={setVolume}
      />
    </div>
  );
}
