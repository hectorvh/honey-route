'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

type Severity = 'low' | 'medium' | 'high';

type StoredResult = {
  jobId: string;
  status: 'queued' | 'running' | 'done' | 'error';
  progress?: number;
  risk: Severity;
  detections: Array<{ label: string; severity: Severity }>;
};

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
};

const tv = (t: (k: string) => string, k: string, fb: string) => {
  const v = t(k);
  return v === k ? fb : v;
};

function severityPillClasses(sev: Severity): string {
  if (sev === 'high') return 'bg-rose-500/15 text-rose-300 border border-rose-500/40';
  if (sev === 'medium') return 'bg-amber-400/15 text-amber-300 border border-amber-400/40';
  return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';
}

function severityDotClasses(sev: Severity): string {
  if (sev === 'high') return 'bg-rose-500';
  if (sev === 'medium') return 'bg-amber-400';
  return 'bg-emerald-500';
}

// Traducir labels específicos de detecciones conocidas
function translateDetectionLabel(label: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    'High temperature detected': tv(t, 'alerts.items.a1.title', 'High temperature detected'),
    'Humidity out of optimal range': tv(
      t,
      'alerts.items.a2.title',
      'Humidity out of optimal range'
    ),
    'Queen status requires attention': tv(
      t,
      'alerts.items.a3.title',
      'Queen status requires attention'
    ),
    'Low temperature detected': tv(t, 'alerts.items.a4.title', 'Low temperature detected'),
  };

  return map[label] ?? label;
}

// Traducir fuente / origen del análisis si viene como slug
function translateSource(source: string | null | undefined, t: (k: string) => string): string {
  if (!source) return '';
  if (source === 'quick-analysis') {
    // Reusamos el título de Quick Analysis
    return tv(t, 'quickAnalysis.title', 'Quick Analysis');
  }
  return source;
}

export default function ResultClient() {
  const { t } = useI18n();
  const router = useRouter();

  const [result, setResult] = useState<StoredResult | null>(null);
  const [meta, setMeta] = useState<AnalysisMeta | null>(null);
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Mapa de status → label traducido
  const statusLabelMap: Record<StoredResult['status'], string> = {
    queued: tv(t, 'analysis.result.status.queued', 'Queued'),
    running: tv(t, 'analysis.result.status.running', 'Running'),
    done: tv(t, 'analysis.result.status.done', 'Done'),
    error: tv(t, 'analysis.result.status.error', 'Error'),
  };

  const statusLabel = statusLabelMap[result?.status || 'queued'];

  // cargar desde sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const rawRes = sessionStorage.getItem('analysisResult');
      const rawMeta = sessionStorage.getItem('analysisMeta');
      const rawPayload = sessionStorage.getItem('analysisPayload');

      if (!rawRes) {
        setError(
          tv(
            t,
            'analysis.result.noResult',
            'No analysis result found. Please start from Quick Analysis.'
          )
        );
        return;
      }

      const parsedRes = JSON.parse(rawRes) as StoredResult;
      setResult(parsedRes);

      if (rawMeta) {
        setMeta(JSON.parse(rawMeta) as AnalysisMeta);
      }

      if (rawPayload) {
        const p = JSON.parse(rawPayload) as AnalysisPayload;
        const count = Array.isArray(p.images) ? p.images.length : 0;
        setMediaCount(count);
      }
    } catch {
      setError(
        tv(
          t,
          'analysis.result.invalid',
          'Could not read analysis result. Please run the analysis again.'
        )
      );
    }
  }, [t]);

  // visual del riesgo: label + ring + descripción
  const riskVisual = useMemo(() => {
    if (!result) {
      return {
        label: '',
        ringBg: 'conic-gradient(#3f3f46 0deg, #18181b 0deg)',
        accent: 'text-neutral-200',
        badgeClasses: 'bg-neutral-800 text-neutral-200 border border-neutral-700',
        description: '',
      };
    }

    const r = result.risk;
    if (r === 'low') {
      return {
        label: tv(t, 'analysis.result.risk.low', 'Low'),
        ringBg: 'conic-gradient(#22c55e 120deg, #18181b 0deg)',
        accent: 'text-emerald-300',
        badgeClasses: severityPillClasses('low'),
        description: tv(
          t,
          'analysis.result.riskLowBody',
          'Overall risk is low; continue routine inspections and monitoring.'
        ),
      };
    }
    if (r === 'medium') {
      return {
        label: tv(t, 'analysis.result.risk.medium', 'Medium'),
        ringBg: 'conic-gradient(#fbbf24 220deg, #18181b 0deg)',
        accent: 'text-amber-300',
        badgeClasses: severityPillClasses('medium'),
        description: tv(
          t,
          'analysis.result.riskMedBody',
          'Some indicators need attention; schedule a focused inspection soon.'
        ),
      };
    }
    return {
      label: tv(t, 'analysis.result.risk.high', 'High'),
      ringBg: 'conic-gradient(#fb7185 320deg, #18181b 0deg)',
      accent: 'text-rose-300',
      badgeClasses: severityPillClasses('high'),
      description: tv(
        t,
        'analysis.result.riskHighBody',
        'High risk detected; prioritize this hive and review critical conditions.'
      ),
    };
  }, [result, t]);

  const summaryText = useMemo(() => {
    const base = tv(t, 'analysis.result.summary', 'Media analyzed: {{count}} image(s)');
    const cnt = mediaCount || 1;
    return base.replace('{{count}}', String(cnt));
  }, [t, mediaCount]);

  const hasError = !!error;

  const handleOpenRecs = () => {
    router.push('/apiaries/quick-analysis/analysis/recommendations');
  };

  const handleLogAction = () => {
    if (meta?.hiveId) {
      router.push(
        `/apiaries/quick-analysis/analysis/history${
          meta?.hiveId ? `?hiveId=${encodeURIComponent(meta.hiveId)}` : ''
        }`
      );
    } else {
      router.push('/apiaries/quick-analysis/analysis/history');
    }
  };

  const handleRunAgain = () => {
    router.replace('/apiaries/quick-analysis');
  };

  const handleGoToHiveOnMap = () => {
    if (!meta?.hiveId) return;
    try {
      localStorage.setItem(
        'map.highlight',
        JSON.stringify({
          hiveId: meta.hiveId,
          name: meta.hiveLabel ?? meta.hiveId,
        })
      );
    } catch {
      // ignore
    }
    router.push('/map');
  };

  const hiveLabelText = tv(t, 'analysis.result.hiveLabel', 'Hive');
  const apiaryLabelText = tv(t, 'analysis.result.apiaryLabel', 'Apiary');
  const sourceDisplay = translateSource(meta?.source, t);

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
      <h1 className="text-[22px] font-extrabold tracking-tight">
        {tv(t, 'analysis.result.title', 'Analysis Result')}
      </h1>

      {hasError ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
            <p className="text-sm font-semibold text-rose-300">
              {tv(t, 'analysis.result.errorTitle', 'No result available')}
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
      ) : !result ? (
        <p className="mt-6 text-sm text-neutral-400">
          {tv(t, 'analysis.result.loading', 'Loading result from session…')}
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {/* HERO: RISK CIRCLE + META */}
          <div className="relative overflow-hidden rounded-2xl bg-neutral-950 ring-1 ring-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/0 to-transparent" />
            <div className="relative flex items-center gap-4 p-4">
              {/* Risk circle */}
              <div className="grid place-items-center">
                <div
                  className="grid h-28 w-28 place-items-center rounded-full"
                  style={{ backgroundImage: riskVisual.ringBg }}
                >
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-neutral-950">
                    <span className={`text-lg font-semibold ${riskVisual.accent}`}>
                      {riskVisual.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Text/meta */}
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  {tv(t, 'analysis.result.riskTitle', 'Risk Level')}
                </p>
                <p className="mt-1 text-xs text-neutral-300">{riskVisual.description}</p>

                <p className="mt-3 text-xs text-neutral-400">
                  {summaryText}
                  {meta?.hiveLabel ? ` · ${hiveLabelText}: ${meta.hiveLabel}` : ''}
                  {meta?.apiaryName ? ` · ${apiaryLabelText}: ${meta.apiaryName}` : ''}
                </p>

                {/* small chips */}
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${riskVisual.badgeClasses}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${severityDotClasses(result.risk)}`} />
                    {tv(t, 'analysis.result.riskChip', 'Overall hive risk')}
                  </span>
                  {sourceDisplay && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/80 px-2 py-1 text-neutral-300 ring-1 ring-black/40">
                      {tv(t, 'analysis.result.sourceChip', 'Source')}: {sourceDisplay}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job / meta info */}
          <div className="rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-100 ring-1 ring-black/5">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {tv(t, 'analysis.result.jobTitle', 'Job Information')}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">{tv(t, 'analysis.result.jobId', 'Job ID')}:</span>{' '}
              {result.jobId}
            </p>
            <p className="text-sm">
              <span className="font-semibold">{tv(t, 'analysis.result.status', 'Status')}:</span>{' '}
              {statusLabel}
              {typeof result.progress === 'number' ? ` (${result.progress}%)` : ''}
            </p>
            {meta?.hiveLabel && (
              <p className="mt-1 text-sm">
                <span className="font-semibold">{hiveLabelText}:</span> {meta.hiveLabel}
              </p>
            )}
            {meta?.apiaryName && (
              <p className="text-sm">
                <span className="font-semibold">{apiaryLabelText}:</span> {meta.apiaryName}
              </p>
            )}
          </div>

          {/* Detecciones */}
          <div className="rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-100 ring-1 ring-black/5">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {tv(t, 'analysis.result.detectionsTitle', 'Detections')}
            </p>
            {result.detections.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-300">
                {tv(
                  t,
                  'analysis.result.noDetections',
                  'No major issues detected in this analysis (demo-only placeholder).'
                )}
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {result.detections.map((d, idx) => {
                  const sevLabel = tv(t, `alerts.sev.${d.severity}`, d.severity);
                  const labelTranslated = translateDetectionLabel(d.label, t);

                  return (
                    <li
                      key={`${d.label}-${idx}`}
                      className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${severityDotClasses(d.severity)}`}
                        />
                        <span>{labelTranslated}</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] uppercase ${severityPillClasses(
                          d.severity
                        )}`}
                      >
                        {sevLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-11 w-full rounded-2xl"
              size="md"
              variant="ghost"
              onClick={handleRunAgain}
            >
              {tv(t, 'analysis.result.again', 'Run again')}
            </Button>
            <Button className="h-11 w-full rounded-2xl" size="md" onClick={handleLogAction}>
              {tv(t, 'analysis.result.logAction', 'View history / log action')}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button className="h-11 w-full rounded-2xl" size="md" onClick={handleOpenRecs}>
              {tv(t, 'hive.advanced.openRecs', 'Open Recommendations')}
            </Button>

            {meta?.hiveId && (
              <Button
                className="h-11 w-full rounded-2xl"
                size="md"
                variant="ghost"
                onClick={handleGoToHiveOnMap}
              >
                {tv(t, 'analysis.result.goMap', 'View hive on map')}
              </Button>
            )}
          </div>
        </div>
      )}
    </CardShell>
  );
}
