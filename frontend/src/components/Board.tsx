import { Square } from './Square';

interface BoardProps {
  squares: (string | null)[];
  onClick: (i: number) => void;
  winningLine: number[] | null;
}

export function Board({ squares, onClick, winningLine }: BoardProps) {
  return (
    <div className="relative">
      {/* Hand-drawn looking grid container */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 p-2 sm:p-4 bg-white/20 rounded-xl shadow-sm backdrop-blur-sm"
           style={{ borderRadius: '20px 25px 15px 30px / 25px 15px 30px 20px', border: '2px solid rgba(148, 163, 184, 0.3)' }}>
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onClick={() => onClick(i)}
            isWinningSquare={winningLine?.includes(i) || false}
          />
        ))}
      </div>
    </div>
  );
}
