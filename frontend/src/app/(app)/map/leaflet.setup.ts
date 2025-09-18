// frontend/src/app/(app)/map/leaflet.setup.ts
'use client';
import L from 'leaflet';

export function installLeafletIcons() {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}
