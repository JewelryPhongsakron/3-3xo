import { corsHeaders } from '@/lib/cors';
import { createModelClient } from '@/lib/modelClient';
import { handleMove } from '@/lib/move';

const modelClient = createModelClient();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await handleMove(body, modelClient);
  return Response.json(result.body, { status: result.status, headers: corsHeaders(request) });
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
