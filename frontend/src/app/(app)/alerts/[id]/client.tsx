// frontend/src/app/(app)/alerts/[id]/client.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

import { getMockAlerts, type AlertItem, type AlertType, type Severity } from '../mock';

/* --- icons --- */
const ICONS: Record<AlertType, string> = {
  temp: '/images/temp.png',
  humidity: '/images/drop.png',
  queen: '/images/queen.png',
};
const HONEY_ICON = '/images/honey.png';

/* --- i18n helper con interpolación --- */
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
  const chosen = raw === k ? fb : raw;
  return fmt(chosen, p);
};

/* --- time ago --- */
function ago(iso: string, t: TFunc) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return tv(t, 'alerts.time.now', 'now');
  if (m < 60) return tv(t, 'alerts.time.m', '{{count}}m', { count: m });
  const h = Math.floor(m / 60);
  if (h < 24) return tv(t, 'alerts.time.h', '{{count}}h', { count: h });
  const dys = Math.floor(h / 24);
  return tv(t, 'alerts.time.d', '{{count}}d', { count: dys });
}

/* --- severity pill --- */
function Pill({ sev }: { sev: Severity }) {
  const { t } = useI18n();
  const styles =
    sev === 'high'
      ? 'bg-rose-500 text-white'
      : sev === 'medium'
        ? 'bg-amber-400 text-black'
        : 'bg-emerald-500 text-white';
  const label =
    sev === 'high'
      ? tv(t, 'alerts.sev.high', 'High')
      : sev === 'medium'
        ? tv(t, 'alerts.sev.medium', 'Medium')
        : tv(t, 'alerts.sev.low', 'Low');
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{label}</span>
  );
}

/* --- sección genérica --- */
function Section({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">{children}</div>;
}

/* --- icono grande por severidad --- */
function IconBadge({ src, sev, size = 56 }: { src: string; sev: Severity; size?: number }) {
  const ring =
    sev === 'high'
      ? 'ring-rose-400/70 bg-white'
      : sev === 'medium'
        ? 'ring-amber-300/80 bg-white'
        : 'ring-emerald-400/70 bg-white';
  const px = size;
  return (
    <div
      className={`grid place-items-center rounded-2xl ring-4 shadow-lg ${ring}`}
      style={{ width: px, height: px }}
    >
      <Image
        src={src}
        alt=""
        width={Math.round(px * 0.46)}
        height={Math.round(px * 0.46)}
        className="brightness-0"
      />
    </div>
  );
}

/* --- hero principal --- */
function AlertHero({
  type,
  sev,
  title,
  createdAt,
}: {
  type: AlertType;
  sev: Severity;
  title: string;
  createdAt: string;
}) {
  const { t } = useI18n();
  const grad =
    sev === 'high'
      ? 'from-rose-500/25 via-rose-500/10 to-transparent'
      : sev === 'medium'
        ? 'from-amber-400/30 via-amber-400/10 to-transparent'
        : 'from-emerald-500/25 via-emerald-500/10 to-transparent';

  const typeLabel =
    type === 'temp'
      ? tv(t, 'alerts.type.temp', 'Temperature')
      : type === 'humidity'
        ? tv(t, 'alerts.type.humidity', 'Humidity')
        : tv(t, 'alerts.type.queen', 'Queen');

  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5">
      <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
      <div className="relative flex items-center gap-3 p-4">
        <IconBadge src={ICONS[type]} sev={sev} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Pill sev={sev} />
            <span className="text-neutral-400 text-xs">·</span>
            <span className="text-xs text-neutral-300">{ago(createdAt, t)}</span>
          </div>
          <h2 className="mt-1 line-clamp-2 text-lg font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-neutral-400">{typeLabel}</p>
        </div>
      </div>
    </div>
  );
}

/* --- recomendaciones rápidas --- */
function ContextCard({ type }: { type: AlertType }) {
  const { t } = useI18n();

  const items =
    type === 'temp'
      ? [
          tv(t, 'analysis.recs.inspectBody', 'Improve ventilation; monitor temperature spikes.'),
          tv(t, 'analysis.recs.spaceBody', 'Add/remove supers to prevent swarming.'),
        ]
      : type === 'humidity'
        ? [
            tv(t, 'analysis.recs.foodBody', 'Ensure enough food; supplement if needed.'),
            tv(t, 'analysis.recs.inspectBody', 'Check for disease/pests, ensure ventilation.'),
          ]
        : [
            tv(t, 'analysis.recs.queenBody', 'Look for a consistent brood pattern.'),
            tv(t, 'analysis.recs.inspectBody', 'Inspect hive health this week.'),
          ];

  const title = tv(t, 'analysis.recs.title', 'Recommendations');

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-md bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
          ★
        </div>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <ul className="ml-4 list-disc space-y-1 text-sm text-neutral-200">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href="/analysis/recommendations"
          className="h-10 rounded-xl bg-amber-400 text-center text-sm font-semibold text-black hover:bg-amber-300"
        >
          {tv(t, 'hive.advanced.openRecs', 'Open Recommendations')}
        </Link>
        <Link
          href="/map"
          className="h-10 rounded-xl bg-neutral-800 text-center text-sm font-semibold text-white ring-1 ring-black/5 hover:bg-neutral-700"
        >
          {tv(t, 'map.title', 'Map')}
        </Link>
      </div>
    </div>
  );
}

export default function AlertDetailClient({ id }: { id: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const item = useMemo(() => getMockAlerts().find((x) => x.id === id), [id]);
  const [saved, setSaved] = useState(false);

  if (!item) {
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
        footer={<NavTab active="alerts" />}
      >
        <h1 className="text-[26px] font-extrabold tracking-tight">
          {tv(t, 'alerts.detail.title', 'Alert Details')}
        </h1>
        <p className="mt-3 text-sm text-neutral-400">
          {tv(t, 'alerts.detail.notFound', 'Alert not found')}
        </p>
      </CardShell>
    );
  }

  const goToHive = () => {
    try {
      localStorage.setItem(
        'map.highlight',
        JSON.stringify({
          hiveId: item.hive.id,
          name: item.hive.name,
          lat: item.hive.lat,
          lng: item.hive.lng,
        })
      );
    } catch {}
    router.push(`/map?hiveId=${encodeURIComponent(item.hive.id)}`);
  };

  const resolve = () => {
    try {
      const raw = localStorage.getItem('resolvedAlerts');
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(item.id)) ids.push(item.id);
      localStorage.setItem('resolvedAlerts', JSON.stringify(ids));
      setSaved(true);
      setTimeout(() => router.replace('/alerts'), 700);
    } catch {
      router.replace('/alerts');
    }
  };

  // título para detalle: si hay listText, úsalo; si no, title básico
  const titleForDetail = item.listText ?? item.title;

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
      footer={<NavTab active="alerts" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">
        {tv(t, 'alerts.detail.title', 'Alert Details')}
      </h1>

      {saved && (
        <div className="mt-3 rounded-xl bg-emerald-600/20 px-3 py-2 text-sm text-emerald-300 ring-1 ring-emerald-700/40">
          {tv(t, 'alerts.detail.resolvedToast', 'Marked as resolved')}
        </div>
      )}

      {/* HERO */}
      <div className="mt-3">
        <AlertHero
          type={item.type}
          sev={item.severity}
          title={titleForDetail}
          createdAt={item.createdAt}
        />
      </div>

      {/* HIVE LINKED */}
      <div className="mt-4">
        <Section>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image src={HONEY_ICON} alt="" width={32} height={32} />
              <div className="min-w-0">
                <p className="truncate font-medium">{item.hive.name}</p>
                <p className="text-xs text-neutral-400">ID: {item.hive.id}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={goToHive}
              className="h-9 rounded-xl bg-amber-400 px-3 text-sm font-semibold text-black ring-1 ring-black/5 hover:bg-amber-300"
            >
              {tv(t, 'alerts.detail.goHive', 'Go to Hive')}
            </button>
          </div>
        </Section>
      </div>

      {/* CAUSE / DETAILS (análisis profundo del mock) */}
      {(item.cause || item.details) && (
        <div className="mt-3">
          <Section>
            <p className="text-sm font-semibold">
              {tv(t, 'alerts.detail.why', 'Why this alert was triggered')}
            </p>
            {item.cause && (
              <p className="mt-2 text-sm text-neutral-200">
                <span className="font-semibold">
                  {tv(t, 'alerts.detail.cause', 'Cause')}:&nbsp;
                </span>
                {item.cause}
              </p>
            )}
            {item.details && (
              <p className="mt-2 text-sm text-neutral-300">
                <span className="font-semibold">
                  {tv(t, 'alerts.detail.details', 'Details')}:&nbsp;
                </span>
                {item.details}
              </p>
            )}
          </Section>
        </div>
      )}

      {/* RECOMENDACIONES */}
      <div className="mt-3">
        <ContextCard type={item.type} />
      </div>

      {/* RESOLVE */}
      <button
        type="button"
        onClick={resolve}
        className="mt-3 h-11 w-full rounded-2xl bg-neutral-900 font-semibold text-white ring-1 ring-black/5 hover:bg-neutral-800"
      >
        {tv(t, 'alerts.detail.resolve', 'Mark as Resolved')}
      </button>
    </CardShell>
  );
}
