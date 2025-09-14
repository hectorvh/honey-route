// frontend/src/app/layout.tsx
import './globals.css';
import { I18nProvider } from '@/i18n/I18nProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
