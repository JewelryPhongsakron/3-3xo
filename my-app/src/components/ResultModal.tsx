import { RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ResultModalProps {
  winner: string | null;
  isDraw: boolean;
  onPlayAgain: () => void;
}

export function ResultModal({ winner, isDraw, onPlayAgain }: ResultModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (winner || isDraw) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 1500); // ดีเลย์ 1.5 วินาทีเพื่อให้ดูผลลัพธ์บนกระดานก่อน
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [winner, isDraw]);

  if (!show) return null;

  let title = '';
  let colorClass = '';
  let bgColorClass = '';

  if (winner === 'X') {
    title = 'You Win! 🎉';
    colorClass = 'text-emerald-600';
    bgColorClass = 'bg-emerald-50 border-emerald-300';
  } else if (winner === 'O') {
    title = 'AI Wins! 🤖';
    colorClass = 'text-rose-600';
    bgColorClass = 'bg-rose-50 border-rose-300';
  } else if (isDraw) {
    title = 'Draw! 🤝';
    colorClass = 'text-amber-600';
    bgColorClass = 'bg-amber-50 border-amber-300';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`p-8 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.15)] border-4 flex flex-col items-center max-w-sm w-full mx-4 ${bgColorClass} animate-in zoom-in-95 duration-300`}
        style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px', transform: 'rotate(1deg)' }}
      >
        <h2 className={`text-4xl font-black mb-6 ${colorClass} text-center`}>
          {title}
        </h2>
        
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-400 text-slate-700 text-xl font-bold hover:brightness-95 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)] focus:outline-none hover:-translate-y-1"
          style={{
            borderRadius: '15px 255px 15px 225px/225px 15px 255px 15px',
          }}
        >
          <RefreshCw className="w-5 h-5" />
          Play Again
        </button>
      </div>
    </div>
  );
}
