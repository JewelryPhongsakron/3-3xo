'use client';

import { useState, useEffect, useEffectEvent } from 'react';
import { loadStarterHistory, pickStarter, saveStarterHistory } from '@/lib/storage';

interface RandomizerModalProps {
  onComplete: (isXNext: boolean) => void;
}

export function RandomizerModal({ onComplete }: RandomizerModalProps) {
  const [currentText, setCurrentText] = useState<'You' | 'AI'>('You');
  const [spinning, setSpinning] = useState(true);
  const complete = useEffectEvent(onComplete);

  useEffect(() => {
    const history = loadStarterHistory();
    const next = pickStarter(history);

    // Flashing animation: ~2 seconds (20 ticks of 100ms), then hold the result
    let tick = 0;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      tick++;
      setCurrentText((prev) => (prev === 'You' ? 'AI' : 'You'));

      if (tick >= 20) {
        clearInterval(interval);
        setSpinning(false);
        setCurrentText(next === 'X' ? 'You' : 'AI');
        // Only save once the pick is final, so StrictMode's double mount does not record it twice
        saveStarterHistory([...history, next]);
        closeTimer = setTimeout(() => complete(next === 'X'), 1200);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      clearTimeout(closeTimer);
    };
  }, []); // Run once on mount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-paper p-8 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.15)] border-4 border-slate-700 flex flex-col items-center max-w-sm w-full mx-4"
        style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px', transform: 'rotate(-1deg)' }}
      >
        <h2 className="text-2xl font-bold text-slate-700 mb-2 underline decoration-wavy decoration-marker-blue">
          Who goes first?
        </h2>

        <div className="flex gap-4 mb-4 text-lg font-bold text-slate-600 bg-white/40 px-4 py-2 rounded-xl border border-slate-200">
          <span className="text-emerald-500">You = X</span>
          <span className="text-slate-300">|</span>
          <span className="text-rose-500">AI = O</span>
        </div>
        
        <div className="h-32 w-full flex items-center justify-center bg-white/50 rounded-xl border-2 border-slate-300 mb-4 overflow-hidden relative">
          <div 
            className={`text-5xl font-black tracking-wider transition-all duration-75 ${
              currentText === 'You' ? 'text-emerald-500' : 'text-rose-500'
            } ${spinning ? 'scale-110 opacity-80' : 'scale-125 opacity-100'}`}
          >
            {currentText}
          </div>
        </div>

        {!spinning && (
          <div className="text-xl font-bold text-slate-600 animate-bounce mt-2">
            {currentText === 'You' ? 'Your Turn!' : 'AI starts!'}
          </div>
        )}
      </div>
    </div>
  );
}
