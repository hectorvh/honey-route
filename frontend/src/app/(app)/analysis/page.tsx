'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

export default function AnalysisLoading() {
  const { t } = useI18n();
  const router = useRouter();

  // progreso arranca en 8% para que se vea “vivo” desde el inicio
  const [progress, setProgress] = useState<number>(8);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  // anillo de progreso
  const circle = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, progress));
    return `conic-gradient(#fbbf24 ${clamped * 3.6}deg, #222 0 360deg)`;
  }, [progress]);

  useEffect(() => {
    // valida que haya “payload” (imágenes o video) de la captura/subida
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('analysisPayload') : null;
    if (!raw) {
      setError(t('analysis.loading.noPayload') ?? 'No images to analyze.');
      return;
    }

    // simulación: ~5 segundos hasta 100%
    const durationMs = 5000;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      // mantenemos un mínimo visible del 8%
      setProgress(Math.max(8, pct));

      if (pct >= 100) {
        // guardamos un “resultado” de ejemplo para la pantalla de resultado
        try {
          const mock = {
            jobId: `sim-${Date.now()}`,
            status: 'done' as const,
            progress: 100,
            risk: 'low' as const,
            detections: [] as Array<{ label: string; severity: 'low' | 'medium' | 'high' }>,
          };
          sessionStorage.setItem('analysisResult', JSON.stringify(mock));
        } catch {
          /* ignore quota */
        }
        router.replace('/analysis/result');
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CardShell
      headerLeft={
        <div className="flex items-center gap-2">
          <BackBtn />
          <BrandMark />
        </div>
      }
      headerRight={<LangToggle />}
      contentClassName="pb-24"
      footer={<NavTab active="home" />}
    >
      <h1 className="text-[22px] font-bold">{t('analysis.loading.title') ?? 'Analysis'}</h1>

      <div className="mt-8 grid place-items-center gap-4">
        <div
          aria-label="progress ring"
          className="grid h-32 w-32 place-items-center rounded-full"
          style={{ backgroundImage: circle }}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-neutral-950 text-2xl font-bold">
            {Math.round(progress)}%
          </div>
        </div>

        <p className="text-lg font-semibold">
          {t('analysis.loading.main') ?? 'Analyzing your images...'}
        </p>
        <p className="max-w-xs text-center text-sm text-neutral-400">
          {t('analysis.loading.hint') ?? 'Please wait while we compute risk and detections.'}
        </p>

        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      </div>
    </CardShell>
  );
}
