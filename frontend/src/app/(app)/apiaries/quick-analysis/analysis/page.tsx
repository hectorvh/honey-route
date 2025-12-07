//frontend/src/app/(app)/apiaries/quick-analysis/analysis/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

import { getDemoAlerts, getDemoHives, type Severity } from '@/mocks/demoGuestProfile';

type AnalysisMeta = {
  apiaryId?: string | null;
  apiaryName?: string | null;
  hiveId?: string | null;
  hiveLabel?: string | null;
  source?: string | null;
};

type AnalysisPayload = {
  images?: string[];
  video?: string | null;
  meta?: AnalysisMeta;
};

const tv = (t: (k: string) => string, k: string, fb: string) => {
  const v = t(k);
  return v === k ? fb : v;
};

export default function AnalysisLoading() {
  const { t } = useI18n();
  const router = useRouter();

  const [progress, setProgress] = useState<number>(8);
  const [error, setError] = useState<string | null>(null);
  const [imagesCount, setImagesCount] = useState<number>(0);
  const [hiveLabel, setHiveLabel] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);

  // anillo
  const circle = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, progress));
    return `conic-gradient(#fbbf24 ${clamped * 3.6}deg, #222 0 360deg)`;
  }, [progress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = sessionStorage.getItem('analysisPayload');
    if (!raw) {
      setError(
        tv(
          t,
          'analysis.loading.noPayload',
          'No images to analyze. Please start from Quick Analysis.'
        )
      );
      return;
    }

    let payload: AnalysisPayload | null = null;
    let meta: AnalysisMeta | null = null;
    try {
      payload = JSON.parse(raw) as AnalysisPayload;
      const metaRaw = sessionStorage.getItem('analysisMeta');
      meta = metaRaw ? (JSON.parse(metaRaw) as AnalysisMeta) : (payload.meta ?? null);
    } catch {
      setError(
        tv(
          t,
          'analysis.loading.invalidPayload',
          'Could not read analysis data. Please try again from Quick Analysis.'
        )
      );
      return;
    }

    const imgs = Array.isArray(payload.images) ? payload.images.length : 0;
    setImagesCount(imgs);
    setHiveLabel(meta?.hiveLabel ?? null);

    if (imgs === 0 && !payload.video) {
      setError(
        tv(
          t,
          'analysis.loading.noMedia',
          'No media found in analysis payload. Please add at least one photo.'
        )
      );
      return;
    }

    // ------- Alineación con alerts + hives del demo -------
    let derivedRisk: Severity = 'low';
    let detections: Array<{ label: string; severity: Severity }> = [];

    try {
      const hiveId = meta?.hiveId ?? null;

      if (hiveId) {
        const alerts = getDemoAlerts().filter((a) => a.hive.id === hiveId);

        if (alerts.length > 0) {
          const rank: Record<Severity, number> = { low: 1, medium: 2, high: 3 };
          // riesgo = severidad más alta de sus alertas
          derivedRisk = alerts.reduce<Severity>(
            (acc, a) => (rank[a.severity] > rank[acc] ? a.severity : acc),
            'low'
          );

          detections = alerts.map((a) => ({
            label: a.title,
            severity: a.severity,
          }));
        } else {
          // fallback: usar el status del hive
          const allHives = getDemoHives();
          const hive = allHives.find((h) => h.id === hiveId);
          if (hive) {
            if (hive.status === 'critical') derivedRisk = 'high';
            else if (hive.status === 'attention') derivedRisk = 'medium';
            else derivedRisk = 'low';
          }
        }
      }
    } catch {
      // en demo, si algo truena, dejamos low + detections vacíos
    }

    // ------- Simulación de análisis con ese resultado -------
    const durationMs = 5000;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress((prev) => Math.max(prev, Math.max(8, pct)));

      if (pct >= 100) {
        try {
          const mock = {
            jobId: `sim-${Date.now()}`,
            status: 'done' as const,
            progress: 100,
            risk: derivedRisk,
            detections,
          };
          sessionStorage.setItem('analysisResult', JSON.stringify(mock));
        } catch {
          // ignore
        }
        router.replace('/apiaries/quick-analysis/analysis/result');
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [t, router]);

  const hasError = !!error;

  const summaryText = useMemo(() => {
    const tpl = tv(t, 'analysis.loading.summary', 'Media: {{count}} image(s)');
    return tpl.replace('{{count}}', String(imagesCount || 1));
  }, [t, imagesCount]);

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
      <h1 className="text-[22px] font-bold">{tv(t, 'analysis.loading.title', 'Analysis')}</h1>

      {hasError ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
            <p className="text-sm font-semibold text-rose-300">
              {tv(t, 'analysis.loading.errorTitle', 'Nothing to analyze')}
            </p>
            <p className="mt-2 text-sm text-neutral-300">{error}</p>
          </div>

          <Button
            className="h-11 w-full rounded-2xl"
            size="lg"
            onClick={() => router.replace('/apiaries/quick-analysis')}
          >
            {tv(t, 'analysis.loading.backToQuick', 'Go to Quick Analysis')}
          </Button>
        </div>
      ) : (
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
            {tv(t, 'analysis.loading.main', 'Analyzing your images...')}
          </p>

          <p className="max-w-xs text-center text-sm text-neutral-400">
            {tv(
              t,
              'analysis.loading.hint',
              'Please wait while we compute risk, detections and health indicators.'
            )}
          </p>

          <p className="text-xs text-neutral-500">
            {summaryText}
            {hiveLabel ? ` · Hive: ${hiveLabel}` : ''}
          </p>
        </div>
      )}
    </CardShell>
  );
}
