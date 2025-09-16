//frontend/src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HoneyRoute',
    short_name: 'HoneyRoute',
    description: 'Your apiary management, simplified.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      { src: '/icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable.png', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      {
        src: '/screenshots/phone-login.png',
        sizes: '1080x2400',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Login',
      },
      {
        src: '/screenshots/phone-home.png',
        sizes: '1080x2400',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Home',
      },
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Home (Desktop)',
      },
    ],
  };
}
