export const config = {
  modelServiceUrl: process.env.MODEL_SERVICE_URL || 'http://localhost:5001',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  modelTimeoutMs: Number(process.env.MODEL_TIMEOUT_MS) || 60_000,
};
