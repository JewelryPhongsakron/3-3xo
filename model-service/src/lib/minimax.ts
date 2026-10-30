import { calculateWinner, type Board, type Player } from './board';

const opponentOf = (player: Player): Player => (player === 'X' ? 'O' : 'X');

// Score from the AI's point of view: prefer fast wins and slow losses.
function minimax(squares: Board, depth: number, isMaximizing: boolean, ai: Player): number {
  const winner = calculateWinner(squares);
  if (winner === ai) return 10 - depth;
  if (winner) return depth - 10;
  if (!squares.includes(null)) return 0; // draw

  const current = isMaximizing ? ai : opponentOf(ai);
  let best = isMaximizing ? -Infinity : Infinity;

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] !== null) continue;
    squares[i] = current;
    const score = minimax(squares, depth + 1, !isMaximizing, ai);
    squares[i] = null;
    best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

// Returns the best index for `ai`, or -1 if the game is already over.
export function bestMove(input: Board, ai: Player = 'O'): number {
  const squares = input.slice(); // never mutate the caller's board
  if (calculateWinner(squares) || !squares.includes(null)) return -1;

  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] !== null) continue;
    squares[i] = ai;
    const score = minimax(squares, 0, false, ai);
    squares[i] = null;
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}
