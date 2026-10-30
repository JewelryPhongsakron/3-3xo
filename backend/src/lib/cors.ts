import { config } from './config';

// Echo the request origin back only if it is allowed by CORS_ORIGIN.
export function corsHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (config.corsOrigin === '*') {
    headers['Access-Control-Allow-Origin'] = '*';
    return headers;
  }
  const origin = request.headers.get('origin');
  const allowed = config.corsOrigin.split(',').map((o) => o.trim());
  if (origin && allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}
