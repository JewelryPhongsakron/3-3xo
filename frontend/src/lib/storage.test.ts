import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadStats, pickStarter } from './storage';

describe('loadStats', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    });
  });

  it('starts at zero when nothing is saved', () => {
    expect(loadStats()).toEqual({ wins: 0, losses: 0, draws: 0 });
  });

  it('recovers from the old { win, loss, draw } / NaN format', () => {
    localStorage.setItem('xo_stats', JSON.stringify({ win: 0, loss: 0, draw: 0, wins: null }));
    expect(loadStats()).toEqual({ wins: 0, losses: 0, draws: 0 });
  });

  it('ignores corrupted JSON', () => {
    localStorage.setItem('xo_stats', '{oops');
    expect(loadStats()).toEqual({ wins: 0, losses: 0, draws: 0 });
  });
});

describe('pickStarter', () => {
  it('forces the other side after two starts in a row', () => {
    expect(pickStarter(['X', 'X'], () => 0)).toBe('O');
    expect(pickStarter(['O', 'O'], () => 0.9)).toBe('X');
  });

  it('is random otherwise', () => {
    expect(pickStarter(['X', 'O'], () => 0.1)).toBe('X');
    expect(pickStarter([], () => 0.9)).toBe('O');
  });
});
