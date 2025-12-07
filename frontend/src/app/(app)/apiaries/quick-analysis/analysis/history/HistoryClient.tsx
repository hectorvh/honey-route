// frontend/src/app/(app)/apiaries/quick-analysis/analysis/history/HistoryClient.tsx
'use client';

import Image from 'next/image';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

export type Kpis = {
  totalInspections: number;
  avgHealthPct: number; // 0..100
  honeyLbs: number;
};

export type ActionEntry = {
  id: string;
  type: 'inspection' | 'harvest' | 'queen' | 'pest';
  title: string; // puede venir en inglés del server
  createdAt: string; // ISO
  note?: string; // puede venir en inglés o escrito por el usuario
};

// Helpers i18n con fallback y {{count}}
function tv(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}
function tvCount(
  t: (k: string) => string,
  key: string,
  fallbackPattern: string,
  count: number
): string {
  return tv(t, key, fallbackPattern).replace('{{count}}', String(count));
}

function formatAgo(d: Date, t: (k: string) => string) {
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return tv(t, 'history.time.now', 'Just now');
  if (m < 60) return tvCount(t, 'history.time.m', '{{count}} min ago', m);
  const h = Math.floor(m / 60);
  if (h < 24) return tvCount(t, 'history.time.h', '{{count}} h ago', h);
  const days = Math.floor(h / 24);
  return tvCount(t, 'history.time.d', '{{count}} days ago', days);
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
      <p className="text-sm font-semibold text-amber-300">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function Row({ entry }: { entry: ActionEntry }) {
  const { t } = useI18n();
  const when = formatAgo(new Date(entry.createdAt), t);

  // Íconos por tipo
  const iconByType: Record<ActionEntry['type'], string> = {
    inspection: '/images/search.png',
    harvest: '/images/honey.png',
    queen: '/images/queen.png',
    pest: '/images/bug.png',
  };

  // Título: prioriza i18n por tipo; si no existe, usa el que viene del server
  const title = tv(t, `history.types.${entry.type}`, entry.title);

  // Nota: si hay una nota i18n para ese tipo, úsala; si no, respeta la del server/usuario
  const localizedNote = tv(t, `history.notes.${entry.type}`, entry.note ?? '');

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400 text-black">
        <Image src={iconByType[entry.type]} alt="" width={18} height={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        <p className="text-sm text-neutral-400">{when}</p>
        {localizedNote ? (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{localizedNote}</p>
        ) : null}
      </div>
      <span className="text-neutral-500">›</span>
    </div>
  );
}

export default function HistoryClient({
  kpis,
  entries,
  hiveName,
}: {
  kpis: Kpis;
  entries: ActionEntry[];
  hiveName?: string;
}) {
  const { t } = useI18n();

  return (
    <CardShell
      headerLeft={
        <div className="flex items-center gap-2">
          <BackBtn />
          <BrandMark />
        </div>
      }
      headerRight={<LangToggle />}
      contentClassName="pb-28"
      footer={<NavTab active="home" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">
        {tv(t, 'history.title', 'History')}
        {hiveName ? <span className="text-neutral-400"> · {hiveName}</span> : null}
      </h1>

      {/* KPIs */}
      <h2 className="mt-5 mb-2 text-sm font-semibold tracking-wide text-neutral-400">
        {tv(t, 'history.kpi', 'Key Performance Indicators')}
      </h2>
      <div className="grid grid-cols-1 gap-3">
        <KPI
          label={tv(t, 'history.kpiTotal', 'Total Inspections')}
          value={String(kpis.totalInspections)}
        />
        <KPI
          label={tv(t, 'history.kpiHealth', 'Average Hive Health')}
          value={`${Math.round(kpis.avgHealthPct)}%`}
        />
        <KPI label={tv(t, 'history.kpiHoney', 'Honey Production')} value={`${kpis.honeyLbs} lbs`} />
      </div>

      {/* Listado */}
      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-neutral-400">
        {tv(t, 'history.log', 'Action Log')}
      </h2>
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-300 ring-1 ring-black/5">
            {tv(t, 'history.empty', 'No actions recorded yet.')}
          </p>
        ) : (
          entries.map((e) => <Row key={e.id} entry={e} />)
        )}
      </div>

      {/* CTA demo */}
      <button
        type="button"
        onClick={() => alert(tv(t, 'history.add.toast', 'Demo: action form coming soon'))}
        className="mt-6 h-12 w-full rounded-2xl bg-amber-400 font-semibold text-black shadow hover:bg-amber-300"
      >
        {tv(t, 'history.add', 'Add action')}
      </button>
    </CardShell>
  );
}
