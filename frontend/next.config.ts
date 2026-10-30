import type { NextConfig } from 'next';

// The game is fully client-side, so it is exported as static files (out/)
// and hosted as a Render Static Site.
const nextConfig: NextConfig = {
  output: 'export',
};

export default nextConfig;
