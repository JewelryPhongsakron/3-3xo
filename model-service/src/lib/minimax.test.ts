import { describe, expect, it } from 'vitest';
import { bestMove } from './minimax';
import { calculateWinner, type Board } from './board';

const _ = null;

describe('bestMove', () => {
  it('takes an immediate win', () => {
    expect(bestMove(['O', 'O', _, 'X', 'X', _, 'X', _, _])).toBe(2);
  });

  it('blocks the opponent from winning', () => {
    expect(bestMove(['X', 'X', _, _, 'O', _, _, _, _])).toBe(2);
  });

  it('returns -1 when the game is over', () => {
    expect(bestMove(['X', 'X', 'X', 'O', 'O', _, _, _, _])).toBe(-1);
    expect(bestMove(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'])).toBe(-1);
  });

  it('does not mutate the input board', () => {
    const board: Board = Array(9).fill(null);
    bestMove(board);
    expect(board).toEqual(Array(9).fill(null));
  });

  it('never loses against every possible opponent line', () => {
    // Exhaustively play every X move sequence against the AI, for both starters.
    function explore(board: Board, xTurn: boolean): void {
      const winner = calculateWinner(board);
      if (winner) {
        expect(winner, JSON.stringify(board)).not.toBe('X');
        return;
      }
      if (!board.includes(null)) return;
      if (xTurn) {
        board.forEach((cell, i) => {
          if (cell !== null) return;
          const next = board.slice();
          next[i] = 'X';
          explore(next, false);
        });
      } else {
        const next = board.slice();
        next[bestMove(board)] = 'O';
        explore(next, true);
      }
    }
    explore(Array(9).fill(null), true);
    explore(Array(9).fill(null), false);
  });
});
