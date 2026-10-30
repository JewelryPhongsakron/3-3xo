'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Board } from './Board';
import { RandomizerModal } from './RandomizerModal';
import { ResultModal } from './ResultModal';
import { fetchAIMove } from '@/lib/api';
import { calculateWinner, emptyBoard, isDraw, type Board as BoardState, type Player } from '@/lib/game';
import { loadStats, saveStats, type Stats } from '@/lib/storage';

// Render free instances sleep; tell the player instead of looking frozen.
const SLOW_RESPONSE_MS = 4000;
const AI_DELAY_MS = 600;

export function Game() {
  const [squares, setSquares] = useState<BoardState>(emptyBoard);
  const [xIsNext, setXIsNext] = useState<boolean | null>(null); // null = starter not picked yet
  const [isRandomizing, setIsRandomizing] = useState(true);
  const [aiError, setAiError] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [stats, setStats] = useState<Stats>(loadStats);

  const winInfo = calculateWinner(squares);
  const winner = winInfo?.winner ?? null;
  const draw = isDraw(squares);
  const gameOver = winner !== null || draw;
  const isAITurn = xIsNext === false && !gameOver && !isRandomizing && !aiError;

  function applyMove(index: number, player: Player) {
    const next = squares.slice();
    next[index] = player;
    setSquares(next);
    setXIsNext(player === 'O');

    const result = calculateWinner(next)?.winner ?? (isDraw(next) ? 'draw' : null);
    if (result) {
      const updated = {
        wins: stats.wins + (result === 'X' ? 1 : 0),
        losses: stats.losses + (result === 'O' ? 1 : 0),
        draws: stats.draws + (result === 'draw' ? 1 : 0),
      };
      setStats(updated);
      saveStats(updated);
    }
  }

  const onAIResponse = useEffectEvent((move: number | null) => {
    setIsWaking(false);
    if (move !== null && move >= 0 && squares[move] === null) {
      applyMove(move, 'O');
    } else {
      setAiError(true);
    }
  });

  useEffect(() => {
    if (!isAITurn) return;
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setIsWaking(true), SLOW_RESPONSE_MS);
    const moveTimer = setTimeout(async () => {
      let move: number | null = null;
      try {
        move = await fetchAIMove(squares, controller.signal);
      } catch (error) {
        if (controller.signal.aborted) return; // game was reset - drop the stale answer
        console.error('Error fetching AI move:', error);
      }
      clearTimeout(slowTimer);
      onAIResponse(move);
    }, AI_DELAY_MS);

    return () => {
      clearTimeout(slowTimer);
      clearTimeout(moveTimer);
      controller.abort();
    };
  }, [isAITurn, squares]);

  const handleClick = (i: number) => {
    if (squares[i] || gameOver || xIsNext !== true || isRandomizing) return;
    applyMove(i, 'X');
  };

  const resetGame = () => {
    setSquares(emptyBoard());
    setXIsNext(null);
    setAiError(false);
    setIsWaking(false);
    setIsRandomizing(true);
  };

  let status: string;
  if (winner) {
    status = winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖';
  } else if (draw) {
    status = 'Draw! 🤝';
  } else if (aiError) {
    status = 'AI is unavailable 😵';
  } else if (isAITurn) {
    status = isWaking ? 'Waking up the AI server... ☕' : 'AI is thinking... 🤔';
  } else {
    status = 'Your turn (X) ✏️';
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

      {gameOver && <ResultModal winner={winner} isDraw={draw} onPlayAgain={resetGame} />}

      <div className="max-w-md w-full flex flex-col items-center">
        {/* Notebook Title */}
        <div className="mb-6 text-center" style={{ transform: 'rotate(-2deg)' }}>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-700 underline decoration-wavy decoration-marker-pink underline-offset-8">
            XO OX
          </h1>
          <p className={`text-xl sm:text-2xl mt-4 font-bold tracking-wide transition-colors duration-300 ${isAITurn ? 'text-marker-blue' : 'text-slate-600'}`}>
            {status}
          </p>
          {aiError && (
            <button
              onClick={() => setAiError(false)}
              className="mt-2 text-lg font-bold text-rose-600 underline decoration-wavy hover:text-rose-700"
            >
              Try again
            </button>
          )}
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
          <Board squares={squares} onClick={handleClick} winningLine={winInfo?.line ?? null} />
          {/* Block clicks while the AI is thinking */}
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
