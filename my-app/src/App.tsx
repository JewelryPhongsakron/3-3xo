import { useState, useEffect } from 'react';
import { Board } from './components/Board';
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
  const [xIsNext, setXIsNext] = useState(true);
  const [isAITurn, setIsAITurn] = useState(false);

  const winInfo = calculateWinner(squares);
  const winner = winInfo?.winner;
  const winningLine = winInfo?.line || null;
  const isDraw = !winner && squares.every((square) => square !== null);

  // Trigger AI move when it's O's turn
  useEffect(() => {
    if (!xIsNext && !winner && !isDraw) {
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
  }, [xIsNext, squares, winner, isDraw]);

  const handleClick = (i: number) => {
    // Prevent clicking if AI is thinking, square is filled, game over, or not X's turn
    if (squares[i] || winner || !xIsNext || isAITurn) {
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
    setXIsNext(true);
    setIsAITurn(false);
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
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Notebook Title */}
        <div className="mb-8 text-center" style={{ transform: 'rotate(-2deg)' }}>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-700 underline decoration-wavy decoration-marker-pink underline-offset-8">
            Tic-Tac-Toe
          </h1>
          <p className={`text-xl sm:text-2xl mt-4 font-bold tracking-wide transition-colors duration-300 ${isAITurn ? 'text-marker-blue' : 'text-slate-600'}`}>
            {status}
          </p>
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
