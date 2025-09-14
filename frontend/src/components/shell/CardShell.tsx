'use client';
import Image from 'next/image';
import { cn } from '@/lib/cn';

type Props = {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  showHeader?: boolean; // ← NUEVO: permite ocultar el header
  heroSrc?: string | null;
  heroAlt?: string;
  heroSlot?: React.ReactNode; // ← Si lo pasas, tú controlas todo el hero (imagen, overlay, toggle)
  className?: string;
  contentClassName?: string;
};

export default function CardShell({
  children,
  headerLeft,
  headerRight,
  showHeader = true,
  heroSrc,
  heroAlt = 'Hero',
  heroSlot,
  className,
  contentClassName,
}: Props) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex items-center justify-center p-4">
      <div
        className={cn(
          'relative w-full max-w-sm h-card max-h-[calc(100dvh-2rem)] overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-2xl',
          className
        )}
      >
        {/* Header opcional */}
        {showHeader && (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">{headerLeft}</div>
            <div>{headerRight}</div>
          </div>
        )}

        {/* Hero: si usas heroSlot, tú dibujas todo; si no, yo pinto imagen + degradado */}
        {(heroSlot || heroSrc) && (
          <div className="relative h-80">
            {heroSlot ? (
              heroSlot
            ) : (
              <>
                <Image src={heroSrc!} alt={heroAlt} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-neutral-950" />
              </>
            )}
          </div>
        )}

        {/* Contenido */}
        <div className={cn('px-6 pb-8 pt-6', contentClassName)}>{children}</div>
      </div>
    </div>
  );
}
