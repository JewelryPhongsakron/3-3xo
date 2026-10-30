export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
] as const;

export function calculateWinner(squares: Board): Player | null {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export function isValidBoard(squares: unknown): squares is Board {
  return (
    Array.isArray(squares) &&
    squares.length === 9 &&
    squares.every((cell) => cell === null || cell === 'X' || cell === 'O')
  );
}
