import { calculateWinner, isAITurn, isValidBoard } from './board';
import type { ModelClient } from './modelClient';

export interface MoveResult {
  status: number;
  body: { move: number } | { error: string };
}

// Body: { squares: (null|'X'|'O')[9] }  ->  { move: number }  (-1 when the game is over)
export async function handleMove(body: unknown, modelClient: ModelClient): Promise<MoveResult> {
  const squares = (body as { squares?: unknown } | null)?.squares;
  if (!isValidBoard(squares)) {
    return { status: 400, body: { error: 'Invalid board state' } };
  }
  if (!isAITurn(squares)) {
    return { status: 400, body: { error: 'Not the AI turn' } };
  }
  if (calculateWinner(squares) || !squares.includes(null)) {
    return { status: 200, body: { move: -1 } };
  }

  let move: number;
  try {
    move = await modelClient.predictMove(squares);
  } catch (err) {
    console.error('Model service error:', err instanceof Error ? err.message : err);
    return { status: 502, body: { error: 'AI service unavailable' } };
  }
  if (!Number.isInteger(move) || squares[move] !== null) {
    console.error('Model service returned an illegal move:', move);
    return { status: 502, body: { error: 'AI returned an invalid move' } };
  }
  return { status: 200, body: { move } };
}
