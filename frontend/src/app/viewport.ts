//frontend/src/app/viewport.ts
import type { Viewport } from 'next';

export const viewport: Viewport = {
  // Puedes usar uno fijo…
  // themeColor: '#0a0a0a',

  // …o por esquema de color:
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbbf24' }, // amber para claro
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }, // casi negro para oscuro
  ],
};
