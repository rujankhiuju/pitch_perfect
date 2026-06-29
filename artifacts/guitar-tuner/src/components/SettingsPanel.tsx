import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  a4: number;
  setA4: (val: number) => void;
  smoothing: number;
  setSmoothing: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
}

export default function SettingsPanel({ isOpen, onClose, a4, setA4, smoothing, setSmoothing, volume, setVolume }: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl z-50 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">Tuner Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* A4 Reference */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-foreground">A4 Reference</label>
                  <span className="text-primary font-mono text-sm">{a4} Hz</span>
                </div>
                <Slider
                  min={430}
                  max={450}
                  step={1}
                  value={[a4]}
                  onValueChange={(vals) => setA4(vals[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>430 Hz</span>
                  <span>440 Hz</span>
                  <span>450 Hz</span>
                </div>
              </div>

              {/* Smoothing */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-foreground">Needle Smoothing</label>
                  <span className="text-muted-foreground text-sm">
                    {smoothing < 0.5 ? 'Fast' : smoothing > 0.8 ? 'Slow' : 'Medium'}
                  </span>
                </div>
                <Slider
                  min={0.1}
                  max={0.9}
                  step={0.1}
                  value={[smoothing]}
                  onValueChange={(vals) => setSmoothing(vals[0])}
                  className="py-4"
                />
              </div>

              {/* Volume */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> Reference Volume
                  </label>
                  <span className="text-muted-foreground text-sm">{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={[volume]}
                  onValueChange={(vals) => setVolume(vals[0])}
                  className="py-4"
                />
              </div>
            </div>
            
            <div className="mt-auto pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Pro Guitar Tuner <br/> Built with Web Audio API
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
