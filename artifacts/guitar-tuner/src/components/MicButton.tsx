import React from 'react';
import { Mic, MicOff, Settings, AlertTriangle } from 'lucide-react';

interface ControlsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  error: string | null;
}

export default function Controls({ isListening, onStart, onStop, onOpenSettings, error }: ControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full mt-auto mb-8">
      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg text-sm max-w-sm text-center">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <button
          onClick={isListening ? onStop : onStart}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-destructive/20 text-destructive border-2 border-destructive shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
          }`}
          data-testid="button-mic-toggle"
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-12 h-12 rounded-full bg-card text-muted-foreground border border-border flex items-center justify-center hover:bg-accent hover:text-foreground transition-colors"
          data-testid="button-settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <span className={`text-sm font-medium tracking-wide uppercase ${isListening ? 'text-primary' : 'text-muted-foreground'}`}>
        {isListening ? 'Listening...' : 'Tap to Start'}
      </span>
    </div>
  );
}
