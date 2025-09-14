'use client';
import Image from 'next/image';
import LangToggle from '@/components/LangToggle';
import { cn } from '@/lib/cn';

export default function HeroScreen({
  heroSrc = '/images/onboarding-hero.jpg',
  heroAlt = 'Hero image',
  heroClassName = '',
  children,
}: {
  heroSrc?: string;
  heroAlt?: string;
  heroClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-2xl">
        {/* Hero (h-80) con toggle superpuesto, idéntico al Onboarding */}
        <div className={cn('relative h-80', heroClassName)}>
          <Image src={heroSrc} alt={heroAlt} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-neutral-950" />
          <div className="absolute top-3 right-3">
            <LangToggle />
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 pb-8 pt-6">{children}</div>
      </div>
    </div>
  );
}
