import React from 'react';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinningSquare: boolean;
}

export function Square({ value, onClick, isWinningSquare }: SquareProps) {
  return (
    <button
      className={`h-24 w-24 sm:h-32 sm:w-32 bg-transparent border-slate-500 border-[3px] flex items-center justify-center text-7xl sm:text-8xl transition-all duration-200 focus:outline-none ${
        isWinningSquare ? 'bg-yellow-200/40 scale-105 z-10 shadow-sm' : 'hover:bg-slate-200/50'
      }`}
      onClick={onClick}
      style={{
        // Make borders look hand-drawn with slightly irregular border radius
        borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
      }}
    >
      <span
        className={`transform transition-all duration-300 ${
          value === 'X' ? 'text-marker-pink scale-100 rotate-2' : value === 'O' ? 'text-marker-blue scale-100 -rotate-2' : 'scale-0'
        }`}
        style={{
          textShadow: value ? '2px 2px 0px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {value}
      </span>
    </button>
  );
}
