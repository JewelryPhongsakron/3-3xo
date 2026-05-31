import { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { RandomizerModal } from './components/RandomizerModal';
import { ResultModal } from './components/ResultModal';
import { RefreshCw } from 'lucide-react';

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

function App() {
  const [squares, setSquares] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean | null>(null); // null means game hasn't started
  const [isAITurn, setIsAITurn] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(true);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('xo_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return { win: 0, loss: 0, draw: 0 };
  });

  const winInfo = calculateWinner(squares);
  const winner = winInfo?.winner;
  const winningLine = winInfo?.line || null;
  const isDraw = !winner && squares.every((square) => square !== null);

  useEffect(() => {
    if (winner === 'X') {
      setStats((prev: any) => {
        const newStats = { ...prev, wins: prev.wins + 1 };
        localStorage.setItem('xo_stats', JSON.stringify(newStats));
        return newStats;
      });
    } else if (winner === 'O') {
      setStats((prev: any) => {
        const newStats = { ...prev, losses: prev.losses + 1 };
        localStorage.setItem('xo_stats', JSON.stringify(newStats));
        return newStats;
      });
    } else if (isDraw) {
      setStats((prev: any) => {
        const newStats = { ...prev, draws: prev.draws + 1 };
        localStorage.setItem('xo_stats', JSON.stringify(newStats));
        return newStats;
      });
    }
  }, [winner, isDraw]);

  // Trigger AI move when it's O's turn
  useEffect(() => {
    if (xIsNext === false && !winner && !isDraw && !isRandomizing) {
      const fetchAIMove = async () => {
        setIsAITurn(true);
        try {
          // Slight delay to make the AI feel natural
          await new Promise(resolve => setTimeout(resolve, 600));

          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await fetch(`${apiUrl}/api/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ squares })
          });

          const data = await response.json();
          if (data.move !== -1 && data.move !== undefined) {
            const nextSquares = squares.slice();
            nextSquares[data.move] = 'O';
            setSquares(nextSquares);
            setXIsNext(true);
          }
        } catch (error) {
          console.error('Error fetching AI move:', error);
        } finally {
          setIsAITurn(false);
        }
      };

      fetchAIMove();
    }
  }, [xIsNext, squares, winner, isDraw, isRandomizing]);

  const handleClick = (i: number) => {
    // Prevent clicking if AI is thinking, square is filled, game over, or not X's turn, or randomizing
    if (squares[i] || winner || xIsNext !== true || isAITurn || isRandomizing) {
      return;
    }

    const row = Math.floor(i / 3);
    const col = i % 3;
    console.log(`Player X clicked on index: ${i} (Row: ${row}, Col: ${col})`);

    const nextSquares = squares.slice();
    nextSquares[i] = 'X';
    setSquares(nextSquares);
    setXIsNext(false); // Now it's O's turn (AI)
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsAITurn(false);
    setIsRandomizing(true);
    setXIsNext(null);
  };

  let status;
  if (winner) {
    status = winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖';
  } else if (isDraw) {
    status = 'Draw! 🤝';
  } else {
    status = isAITurn ? 'AI is thinking... 🤔' : 'Your turn (X) ✏️';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-10 pb-20 px-4">
      {isRandomizing && (
        <RandomizerModal
          onComplete={(isX) => {
            setXIsNext(isX);
            setIsRandomizing(false);
          }}
        />
      )}

      <ResultModal
        winner={winner}
        isDraw={isDraw}
        onPlayAgain={resetGame}
      />

      <div className="max-w-md w-full flex flex-col items-center">

        {/* Notebook Title */}
        <div className="mb-6 text-center" style={{ transform: 'rotate(-2deg)' }}>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-700 underline decoration-wavy decoration-marker-pink underline-offset-8">
            XO OX
          </h1>
          <p className={`text-xl sm:text-2xl mt-4 font-bold tracking-wide transition-colors duration-300 ${isAITurn ? 'text-marker-blue' : 'text-slate-600'}`}>
            {status}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 flex gap-3 sm:gap-4 text-slate-600 font-bold text-base sm:text-lg" style={{ transform: 'rotate(1deg)' }}>
          <div className="px-3 py-2 bg-white/40 rounded-xl shadow-sm border border-slate-300/50 backdrop-blur-sm">
            Wins: <span className="text-emerald-600">{stats.wins}</span>
          </div>
          <div className="px-3 py-2 bg-white/40 rounded-xl shadow-sm border border-slate-300/50 backdrop-blur-sm">
            Losses: <span className="text-rose-600">{stats.losses}</span>
          </div>
          <div className="px-3 py-2 bg-white/40 rounded-xl shadow-sm border border-slate-300/50 backdrop-blur-sm">
            Draws: <span className="text-amber-600">{stats.draws}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-10 relative">
          <Board squares={squares} onClick={handleClick} winningLine={winningLine} />
          {/* Optional: Add a subtle overlay when AI is thinking to prevent clicks */}
          {isAITurn && <div className="absolute inset-0 z-20 cursor-wait"></div>}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-paper border-2 border-slate-400 text-slate-700 text-2xl hover:brightness-95 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)] focus:outline-none hover:-translate-y-1"
          style={{
            borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
          }}
        >
          <RefreshCw className={`w-6 h-6 ${isAITurn ? 'animate-spin' : ''}`} />
          Play Again
        </button>

      </div>
    </div>
  );
}

export default App;
