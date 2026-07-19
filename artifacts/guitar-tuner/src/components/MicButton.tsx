import React from 'react';
import { Mic, MicOff, Settings, AlertTriangle } from 'lucide-react';

interface MicButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  error: string | null;
}

export default function MicButton({ isListening, onStart, onStop, onOpenSettings, error }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full mt-auto pb-[env(safe-area-inset-bottom,16px)] px-4">
      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg text-sm max-w-sm text-center">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={isListening ? onStop : onStart}
          className={`min-w-[56px] min-h-[56px] w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening
              ? 'bg-destructive/20 text-destructive border-2 border-destructive shadow-[0_0_24px_rgba(214,92,92,0.5)] animate-[pulse_1.5s_ease-in-out_infinite]'
              : 'bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg active:scale-95'
          }`}
          data-testid="button-mic-toggle"
        >
          {isListening ? <MicOff className="w-7 h-7 md:w-8 md:h-8" /> : <Mic className="w-7 h-7 md:w-8 md:h-8" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="min-w-[44px] min-h-[44px] w-11 h-11 md:w-12 md:h-12 rounded-full bg-card text-muted-foreground border border-border flex items-center justify-center hover:bg-accent hover:text-foreground transition-colors active:scale-95"
          data-testid="button-settings"
        >
          <Settings className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <span className={`text-sm font-semibold tracking-wider uppercase ${isListening ? 'text-destructive' : 'text-muted-foreground'}`}>
        {isListening ? 'Listening...' : 'Tap to Start'}
      </span>
    </div>
  );
}
