import { describe, expect, it } from 'vitest';
import { POST } from './route';

const post = (body: string) =>
  POST(new Request('http://test/api/predict', { method: 'POST', body }));

describe('POST /api/predict', () => {
  it('returns the best move', async () => {
    const res = await post(JSON.stringify({ squares: ['X', 'X', null, null, 'O', null, null, null, null] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ move: 2 });
  });

  it('rejects invalid input', async () => {
    expect((await post(JSON.stringify({ squares: [1, 2, 3] }))).status).toBe(400);
    expect((await post(JSON.stringify({ squares: Array(9).fill('Z') }))).status).toBe(400);
    expect((await post(JSON.stringify({ squares: Array(9).fill(null), player: 'Q' }))).status).toBe(400);
    expect((await post('not json')).status).toBe(400);
  });
});
