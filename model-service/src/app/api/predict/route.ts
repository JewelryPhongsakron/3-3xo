import { isValidBoard } from '@/lib/board';
import { bestMove } from '@/lib/minimax';

// Body: { squares: (null|'X'|'O')[9], player?: 'X'|'O' }  ->  { move: number }
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const squares: unknown = body?.squares;
  const player: unknown = body?.player ?? 'O';

  if (!isValidBoard(squares)) {
    return Response.json({ error: 'Invalid board state' }, { status: 400 });
  }
  if (player !== 'X' && player !== 'O') {
    return Response.json({ error: 'Invalid player' }, { status: 400 });
  }
  return Response.json({ move: bestMove(squares, player) });
}
