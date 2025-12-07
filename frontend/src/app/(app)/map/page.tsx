//frontend/src/app/(app)/map/page.tsx
'use client';

import dynamic from 'next/dynamic';

// Evita SSR para Leaflet/react-leaflet
const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

export default function MapPage() {
  return <MapClient />;
}
