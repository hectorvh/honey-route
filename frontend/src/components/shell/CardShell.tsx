// frontend/src/components/shell/CardShell.tsx
'use client';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  headerCenter?: React.ReactNode;
  showHeader?: boolean;
  heroSrc?: string | null;
  heroAlt?: string;
  heroClassName?: string; // ← NUEVO
  heroSlot?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Slot fijo abajo (NavTab u otro) */
  footer?: ReactNode;
};

export default function CardShell({
  children,
  headerLeft,
  headerRight,
  headerCenter,
  showHeader = true,
  heroClassName, // ← NUEVO
  heroSrc,
  heroAlt = 'Hero',
  heroSlot,
  className,
  contentClassName,
  footer,
}: Props) {
  const touchScroll: CSSProperties = { WebkitOverflowScrolling: 'touch' };

  return (
    <div className="min-h-dvh bg-neutral-100 flex items-center justify-center p-4">
      <div
        className={cn(
          // ✅ se respeta tu tamaño exacto
          'relative w-full max-w-sm h-card max-h-[calc(100dvh-2rem)] overflow-hidden',
          'rounded-3xl bg-neutral-950 text-white shadow-2xl',
          // layout interno: header | contenido (scroll) | footer
          'grid grid-rows-[auto,1fr,auto]',
          className
        )}
      >
        {/* Header fijo (arriba) */}
        {showHeader ? (
          <header className="px-5 py-4 bg-neutral-950/90 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70">
            <div className="flex items-center justify-between">
              <div className="min-w-0">{headerLeft}</div>
              {headerCenter ? <div className="min-w-0">{headerCenter}</div> : null}
              <div className="min-w-0">{headerRight}</div>
            </div>
          </header>
        ) : (
          <div />
        )}

        {/* Contenido scrollable (en medio) */}
        <main
          className={cn('overflow-y-auto overscroll-contain px-6 pt-6 pb-4', contentClassName)}
          style={touchScroll}
        >
          {/* Hero opcional: vive dentro del contenido, por lo tanto se desliza */}
          {(heroSlot || heroSrc) && (
            <div
              className={cn(
                'relative mb-4 h-48 overflow-hidden rounded-2xl', // valores por defecto
                heroClassName // ← ahora sí se aplica
              )}
            >
              {heroSlot ? (
                heroSlot
              ) : (
                <>
                  <Image src={heroSrc!} alt={heroAlt} fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-neutral-950/10" />
                </>
              )}
            </div>
          )}

          {children}
        </main>

        {/* Footer fijo (abajo): pon aquí tu <NavTab /> */}
        {footer ? (
          <footer className="border-t border-neutral-800 bg-neutral-950/95 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)] backdrop-blur">
            {footer}
          </footer>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
