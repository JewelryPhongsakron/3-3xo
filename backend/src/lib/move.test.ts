import { describe, expect, it, vi } from 'vitest';
import { handleMove } from './move';
import type { ModelClient } from './modelClient';

const _ = null;
const client = (predictMove: ModelClient['predictMove']): ModelClient => ({ predictMove });
const neverCalled = client(async () => {
  throw new Error('model should not be called');
});

describe('handleMove', () => {
  it('forwards a valid board to the model service', async () => {
    const result = await handleMove({ squares: ['X', _, _, _, _, _, _, _, _] }, client(async () => 4));
    expect(result).toEqual({ status: 200, body: { move: 4 } });
  });

  it('rejects malformed boards and out-of-turn requests', async () => {
    const statusOf = async (squares: unknown) => (await handleMove({ squares }, neverCalled)).status;
    expect(await statusOf([1, 2, 3])).toBe(400);
    expect(await statusOf(Array(9).fill('Z'))).toBe(400);
    expect(await statusOf(['O', _, _, _, _, _, _, _, _])).toBe(400); // O already moved
    expect(await statusOf(['X', 'X', _, _, _, _, _, _, _])).toBe(400); // X moved twice
    expect((await handleMove(null, neverCalled)).status).toBe(400);
  });

  it('returns -1 without calling the model when the game is over', async () => {
    const result = await handleMove({ squares: ['X', 'X', 'X', 'O', 'O', _, _, _, _] }, neverCalled);
    expect(result).toEqual({ status: 200, body: { move: -1 } });
  });

  it('returns 502 when the model service fails or answers an illegal move', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const board = { squares: ['X', _, _, _, _, _, _, _, _] };
    const down = client(async () => {
      throw new Error('ECONNREFUSED');
    });
    expect((await handleMove(board, down)).status).toBe(502);
    expect((await handleMove(board, client(async () => 0))).status).toBe(502); // square 0 is taken
  });
});
