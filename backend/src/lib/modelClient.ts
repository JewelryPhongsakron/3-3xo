import type { Board } from './board';
import { config } from './config';

export interface ModelClient {
  predictMove(squares: Board): Promise<number>;
}

// HTTP client for the model service. Kept behind an interface so tests can swap it.
export function createModelClient(
  baseUrl = config.modelServiceUrl,
  timeoutMs = config.modelTimeoutMs,
): ModelClient {
  return {
    async predictMove(squares) {
      const response = await fetch(`${baseUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squares, player: 'O' }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        throw new Error(`Model service responded with ${response.status}`);
      }
      const { move } = await response.json();
      return move;
    },
  };
}
