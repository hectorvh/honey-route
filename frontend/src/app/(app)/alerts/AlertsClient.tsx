'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import { useI18n } from '@/i18n/I18nProvider';

import { getMockAlerts, type AlertItem, type AlertType, type Severity } from './mock';

const ICONS: Record<AlertType, string> = {
  temp: '/images/temp.png',
  humidity: '/images/drop.png',
  queen: '/images/queen.png',
};

const tv = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

function ago(iso: string, t: (k: string) => string) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return tv(t, 'alerts.time.now', 'now');
  if (m < 60) return tv(t, 'alerts.time.m', '{{count}}m').replace('{{count}}', String(m));
  const h = Math.floor(m / 60);
  if (h < 24) return tv(t, 'alerts.time.h', '{{count}}h').replace('{{count}}', String(h));
  const dys = Math.floor(h / 24);
  return tv(t, 'alerts.time.d', '{{count}}d').replace('{{count}}', String(dys));
}

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

function Row({ a, onClick }: { a: AlertItem; onClick: () => void }) {
  const { t } = useI18n();
  const title = a.listKey ? tv(t, a.listKey, a.listText ?? a.title) : (a.listText ?? a.title);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-neutral-900 p-3 text-left ring-1 ring-black/5 transition hover:bg-neutral-800"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white">
          <Image
            src={ICONS[a.type]}
            alt=""
            width={18}
            height={18}
            className="filter brightness-0"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {a.hive.name}: {title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-400">
            <span className="inline-block">
              <Pill sev={a.severity} />
            </span>
            <span>·</span>
            <span>{ago(a.createdAt, t)}</span>
          </div>
        </div>

        <span className="text-neutral-500">›</span>
      </div>
    </button>
  );
}

type SevFilter = 'all' | Severity;
type TypeFilter = 'all' | AlertType;

export default function AlertsClient() {
  const { t } = useI18n();
  const router = useRouter();

  const items: AlertItem[] = useMemo(() => getMockAlerts(), []);
  const [sev, setSev] = useState<SevFilter>('all');
  const [typ, setTyp] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<'recent' | 'severity'>('recent');

  const filtered = useMemo(() => {
    let out = items.slice();
    if (sev !== 'all') out = out.filter((a) => a.severity === sev);
    if (typ !== 'all') out = out.filter((a) => a.type === typ);
    if (sort === 'severity') {
      const rank: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
      out.sort((a, b) => rank[b.severity] - rank[a.severity]);
    } else {
      out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return out;
  }, [items, sev, typ, sort]);

  const Chip = ({
    active,
    children,
    onClick,
    iconSrc,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
    iconSrc?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ring-1 ring-black/5 transition ${
        active
          ? 'bg-amber-400 text-black font-semibold'
          : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
      }`}
    >
      {iconSrc ? (
        <Image src={iconSrc} alt="" width={14} height={14} className="filter brightness-0" />
      ) : null}
      {children}
    </button>
  );

  return (
    <CardShell
      headerLeft={<BrandMark />}
      headerRight={<LangToggle />}
      contentClassName="pb-24"
      footer={<NavTab active="alerts" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">
        {tv(t, 'alerts.title', 'Alerts')}
      </h1>

      {/* Filters */}
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-400">
            {tv(t, 'alerts.filter.sev', 'Severity')}:
          </span>
          <Chip active={sev === 'all'} onClick={() => setSev('all')}>
            {tv(t, 'alerts.filter.all', 'All')}
          </Chip>
          <Chip active={sev === 'high'} onClick={() => setSev('high')}>
            {tv(t, 'alerts.sev.high', 'High')}
          </Chip>
          <Chip active={sev === 'medium'} onClick={() => setSev('medium')}>
            {tv(t, 'alerts.sev.medium', 'Medium')}
          </Chip>
          <Chip active={sev === 'low'} onClick={() => setSev('low')}>
            {tv(t, 'alerts.sev.low', 'Low')}
          </Chip>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-400">{tv(t, 'alerts.filter.type', 'Type')}:</span>
          <Chip active={typ === 'all'} onClick={() => setTyp('all')}>
            {tv(t, 'alerts.filter.all', 'All')}
          </Chip>
          <Chip active={typ === 'temp'} onClick={() => setTyp('temp')}>
            {tv(t, 'alerts.type.temp', 'Temperature')}
          </Chip>
          <Chip active={typ === 'humidity'} onClick={() => setTyp('humidity')}>
            {tv(t, 'alerts.type.humidity', 'Humidity')}
          </Chip>
          <Chip active={typ === 'queen'} onClick={() => setTyp('queen')}>
            {tv(t, 'alerts.type.queen', 'Queen')}
          </Chip>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-400">{tv(t, 'alerts.sort', 'Sort by')}:</span>
          <Chip active={sort === 'recent'} onClick={() => setSort('recent')}>
            {tv(t, 'alerts.sort.recent', 'Most recent')}
          </Chip>
          <Chip active={sort === 'severity'} onClick={() => setSort('severity')}>
            {tv(t, 'alerts.sort.severity', 'Severity')}
          </Chip>
        </div>
      </div>

      {/* List */}
      <div className="mt-5 space-y-3">
        {filtered.map((a) => (
          <Row key={a.id} a={a} onClick={() => router.push(`/alerts/${a.id}`)} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-300 ring-1 ring-black/5">
            {tv(t, 'alerts.empty', 'No matching alerts')}
          </p>
        )}
      </div>
    </CardShell>
  );
}
