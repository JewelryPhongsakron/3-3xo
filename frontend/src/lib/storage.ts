import type { Player } from './game';

export interface Stats {
  wins: number;
  losses: number;
  draws: number;
}

const STATS_KEY = 'xo_stats';
const STARTER_KEY = 'xo_starter_history';

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked (private mode) - the game still works without it
  }
}

const count = (value: unknown) => (Number.isFinite(value) ? (value as number) : 0);

// Older builds saved { win, loss, draw } and could store NaN, so normalise whatever is there.
export function loadStats(): Stats {
  const saved = (read(STATS_KEY) ?? {}) as Record<string, unknown>;
  return {
    wins: count(saved.wins),
    losses: count(saved.losses),
    draws: count(saved.draws),
  };
}

export function saveStats(stats: Stats) {
  write(STATS_KEY, stats);
}

export function loadStarterHistory(): Player[] {
  const saved = read(STARTER_KEY);
  return Array.isArray(saved) ? saved.filter((p): p is Player => p === 'X' || p === 'O') : [];
}

export function saveStarterHistory(history: Player[]) {
  write(STARTER_KEY, history.slice(-2));
}

// Random starter, but never let the same side start three games in a row.
export function pickStarter(history: Player[], random = Math.random): Player {
  const [prev2, prev1] = history.slice(-2);
  if (prev1 && prev1 === prev2) return prev1 === 'X' ? 'O' : 'X';
  return random() < 0.5 ? 'X' : 'O';
}
