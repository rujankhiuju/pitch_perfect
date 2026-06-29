import { useState, useRef, useCallback } from 'react';

export function useReferenceTone() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((frequency: number, volume: number = 0.5) => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    setIsPlaying(true);

    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      osc.stop(ctx.currentTime + 0.1);
      setTimeout(() => {
        if (ctx.state !== 'closed') ctx.close();
        setIsPlaying(false);
      }, 100);
    };
  }, []);

  const stopTone = useCallback(() => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { isPlaying, playTone, stopTone };
}
