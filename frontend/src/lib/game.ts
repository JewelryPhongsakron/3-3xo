export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

export function calculateWinner(squares: Board): { winner: Player; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const value = squares[a];
    if (value && value === squares[b] && value === squares[c]) {
      return { winner: value, line };
    }
  }
  return null;
}

export function isDraw(squares: Board): boolean {
  return !calculateWinner(squares) && squares.every((cell) => cell !== null);
}

export const emptyBoard = (): Board => Array(9).fill(null);
