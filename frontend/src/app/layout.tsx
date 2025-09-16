// frontend/src/app/layout.tsx
import './globals.css';
import { I18nProvider } from '@/i18n/I18nProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HoneyRoute',
  themeColor: '#0A0A0A',
  icons: [
    { rel: 'icon', url: '/icons/favicon.png', sizes: '32x32' },
    { rel: 'apple-touch-icon', url: '/icon.png' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
