'use client';

import dynamic from 'next/dynamic';

// The game reads localStorage and picks a random starter, so it only renders in the browser.
export const ClientGame = dynamic(() => import('./Game').then((m) => m.Game), { ssr: false });
