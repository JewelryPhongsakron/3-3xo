import type { Board } from './game';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchAIMove(squares: Board, signal?: AbortSignal): Promise<number> {
  const response = await fetch(`${API_URL}/api/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ squares }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }
  const { move } = await response.json();
  return move;
}
