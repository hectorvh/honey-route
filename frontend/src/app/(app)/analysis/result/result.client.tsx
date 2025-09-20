// frontend/src/app/(app)/analysis/result/result.client.tsx
'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import BackBtn from '@/components/BackBtn';
import NavTab from '@/components/NavTab';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';
import { AnalysisStatusResponse, getAnalysis } from '@/lib/api';

/* ---------------- i18n helpers con fallback + interpolación ---------------- */
type TFunc = (k: string, p?: Record<string, unknown>) => string;

const fmt = (s: string, p?: Record<string, unknown>) => {
  if (!p) return s;
  let out = s;
  for (const [k, v] of Object.entries(p)) {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
    out = out.replace(re, String(v));
  }
  return out;
};
const tv = (t: TFunc, k: string, fb: string, p?: Record<string, unknown>) => {
  const raw = t(k, p);
  return fmt(raw === k ? fb : raw, p);
};

/* ---------------- UI pequeñas: Pill + Gauge ---------------- */
function Pill({
  text,
  tone,
}: {
  text: 'Low' | 'Medium' | 'High' | string;
  tone: 'low' | 'medium' | 'high';
}) {
  const map = {
    low: 'bg-emerald-500/90 text-white',
    medium: 'bg-amber-400 text-black',
    high: 'bg-rose-500 text-white',
  } as const;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[tone]}`}>{text}</span>
  );
}

function RiskGauge({ risk, label }: { risk: 'low' | 'medium' | 'high'; label: string }) {
  const value = risk === 'high' ? 88 : risk === 'medium' ? 62 : 28;
  const R = 28;
  const C = 2 * Math.PI * R;
  const off = C * (1 - value / 100);
  const color = risk === 'high' ? '#ef4444' : risk === 'medium' ? '#f59e0b' : '#10b981';
  const glow =
    risk === 'high'
      ? 'shadow-[0_0_32px_rgba(239,68,68,0.45)]'
      : risk === 'medium'
        ? 'shadow-[0_0_32px_rgba(245,158,11,0.35)]'
        : 'shadow-[0_0_28px_rgba(16,185,129,0.35)]';
  return (
    <div
      className={`grid place-items-center rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5 ${glow}`}
    >
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} stroke="#1f2937" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={R}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={C.toFixed(2)}
          strokeDashoffset={off.toFixed(2)}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="50%" y="46%" textAnchor="middle" fontSize="12" fill="#9ca3af">
          {label}
        </text>
        <text x="50%" y="60%" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff">
          {value}
        </text>
      </svg>
    </div>
  );
}

/* ---------------- Icons sugeridos para detecciones ---------------- */
const DET_ICONS: Record<string, string> = {
  varroa: '/images/bug.png',
  brood: '/images/brood.png',
  queen: '/images/queen.png',
  pollen: '/images/pollen.png',
  honey: '/images/honey.png',
};

/* ---------------- Type guards para campos opcionales ---------------- */
type WithMeta = { meta?: { imagesCount?: number; seconds?: number } };
type WithImages = { images?: unknown[] };

function hasMeta(x: unknown): x is WithMeta {
  return typeof x === 'object' && x !== null && 'meta' in x;
}
function hasImages(x: unknown): x is WithImages {
  return typeof x === 'object' && x !== null && 'images' in x;
}

/* ---------------- Página ---------------- */
export default function ResultClient() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();

  const [data, setData] = useState<AnalysisStatusResponse | null>(null);

  useEffect(() => {
    (async () => {
      const urlId = sp.get('jobId');
      if (urlId) {
        const s = await getAnalysis(urlId);
        setData(s);
      } else {
        const raw = sessionStorage.getItem('analysisResult');
        if (raw) setData(JSON.parse(raw));
      }
    })();
  }, [sp]);

  const riskLevel: 'low' | 'medium' | 'high' =
    (data?.riskLevel as 'low' | 'medium' | 'high') ?? 'low';
  const riskText =
    riskLevel === 'high'
      ? tv(t, 'analysis.result.risk.high', 'High')
      : riskLevel === 'medium'
        ? tv(t, 'analysis.result.risk.medium', 'Medium')
        : tv(t, 'analysis.result.risk.low', 'Low');

  // Agrupar detecciones por severidad
  const groups = useMemo(() => {
    const list =
      (
        data as unknown as {
          detections?: Array<{ id: string; name?: string; severity: 'low' | 'medium' | 'high' }>;
        }
      )?.detections ?? [];
    return {
      high: list.filter((d) => d.severity === 'high'),
      medium: list.filter((d) => d.severity === 'medium'),
      low: list.filter((d) => d.severity === 'low'),
    };
  }, [data]);

  // helpers navegación preservando query actual
  const qs = sp.toString();
  const goRecs = () => router.push(`/analysis/recommendations${qs ? `?${qs}` : ''}`);
  const goLog = () => router.push(`/analysis/history${qs ? `?${qs}` : ''}`);

  // meta de resumen (con type-guards y fallbacks)
  const imagesCount = useMemo(() => {
    const d = data as unknown;
    if (hasMeta(d) && d.meta && typeof d.meta.imagesCount === 'number') return d.meta.imagesCount;
    if (hasImages(d) && Array.isArray(d.images)) return d.images.length;
    return 0;
  }, [data]);

  const seconds = useMemo(() => {
    const d = data as unknown;
    if (hasMeta(d) && d.meta && typeof d.meta.seconds === 'number') return d.meta.seconds;
    return 3;
  }, [data]);

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
      {/* HERO compacto con fondo según riesgo */}
      <div
        className={`rounded-2xl p-4 ring-1 ring-black/5 ${
          riskLevel === 'high'
            ? 'bg-gradient-to-br from-rose-600/20 via-rose-700/15 to-rose-900/10'
            : riskLevel === 'medium'
              ? 'bg-gradient-to-br from-amber-400/20 via-amber-500/15 to-amber-700/10'
              : 'bg-gradient-to-br from-emerald-500/20 via-emerald-600/15 to-emerald-900/10'
        }`}
      >
        <div className="flex items-center gap-4">
          <RiskGauge risk={riskLevel} label={tv(t, 'analysis.result.riskShort', 'RISK')} />
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold tracking-tight">
              {tv(t, 'analysis.result.title', 'Analysis Result')}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Pill text={riskText} tone={riskLevel} />
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-300">
                {tv(t, 'analysis.result.imagesReviewed', '{{count}} images reviewed', {
                  count: imagesCount,
                })}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-300">
                {tv(t, 'analysis.result.timeTaken', 'Processed in {{sec}}s', { sec: seconds })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DETECTIONS por grupos */}
      <div className="mt-4 grid gap-3">
        <section className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <p className="text-sm font-semibold">
            {tv(t, 'analysis.result.detections', 'Detections')}
          </p>

          {/* High */}
          {groups.high.length > 0 && (
            <div className="mt-3 space-y-2">
              {groups.high.map((d) => {
                const name =
                  tv(t, `analysis.result.det.${d.id}`, d.name ?? 'Detection') || 'Detection';
                const sev = tv(t, 'analysis.result.sev.high', 'High');
                const icon = DET_ICONS[d.id] ?? '/images/status.png';
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl bg-rose-500/15 px-3 py-3 ring-1 ring-rose-500/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/90">
                        <Image src={icon} alt="" width={18} height={18} className="brightness-0" />
                      </div>
                      <p className="truncate font-medium">{name}</p>
                    </div>
                    <Pill text={sev} tone="high" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Medium */}
          {groups.medium.length > 0 && (
            <div className="mt-3 space-y-2">
              {groups.medium.map((d) => {
                const name =
                  tv(t, `analysis.result.det.${d.id}`, d.name ?? 'Detection') || 'Detection';
                const sev = tv(t, 'analysis.result.sev.medium', 'Medium');
                const icon = DET_ICONS[d.id] ?? '/images/status.png';
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl bg-amber-400/15 px-3 py-3 ring-1 ring-amber-400/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/90">
                        <Image src={icon} alt="" width={18} height={18} className="brightness-0" />
                      </div>
                      <p className="truncate font-medium">{name}</p>
                    </div>
                    <Pill text={sev} tone="medium" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Low */}
          {groups.low.length > 0 && (
            <div className="mt-3 space-y-2">
              {groups.low.map((d) => {
                const name =
                  tv(t, `analysis.result.det.${d.id}`, d.name ?? 'Detection') || 'Detection';
                const sev = tv(t, 'analysis.result.sev.low', 'Low');
                const icon = DET_ICONS[d.id] ?? '/images/status.png';
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl bg-emerald-500/15 px-3 py-3 ring-1 ring-emerald-500/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/90">
                        <Image src={icon} alt="" width={18} height={18} className="brightness-0" />
                      </div>
                      <p className="truncate font-medium">{name}</p>
                    </div>
                    <Pill text={sev} tone="low" />
                  </div>
                );
              })}
            </div>
          )}

          {/* None */}
          {groups.high.length + groups.medium.length + groups.low.length === 0 && (
            <p className="mt-2 rounded-xl bg-neutral-800 px-3 py-3 text-sm text-neutral-300">
              {tv(t, 'analysis.result.none', 'No issues detected.')}
            </p>
          )}
        </section>

        {/* Next steps */}
        <section className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <p className="text-sm font-semibold">
            {tv(t, 'analysis.result.nextSteps', 'Next steps')}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              {tv(
                t,
                'analysis.recs.inspectBody',
                'Inspect hive health; improve ventilation and monitor temperature spikes.'
              )}
            </li>
            <li>
              {tv(
                t,
                'analysis.recs.foodBody',
                'Check food stores; supplement if needed (e.g., < 6kg honey).'
              )}
            </li>
            <li>
              {tv(t, 'analysis.recs.varroaBody', 'Apply appropriate Varroa treatment this week.')}
            </li>
          </ul>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button onClick={goRecs}>
              {tv(t, 'analysis.result.seeRecs', 'See recommendations')}
            </Button>
            <Button
              className="bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
              onClick={goLog}
            >
              {tv(t, 'analysis.result.logAction', 'Log action')}
            </Button>
          </div>
        </section>
      </div>
    </CardShell>
  );
}
