'use client';

import Image from 'next/image';
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

/* --- tiny i18n helper (fallback legible si falta key) --- */
const tv = (
  t: (k: string, p?: Record<string, unknown>) => string,
  k: string,
  fb: string,
  p?: Record<string, unknown>
) => (t(k, p) === k ? fb : t(k, p));

/* --- time “ago” with i18n --- */
function ago(iso: string, t: (k: string, p?: Record<string, unknown>) => string) {
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

/* --- severity pill that uses i18n labels --- */
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

/* --- small card section --- */
function Section({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">{children}</div>;
}

export default function AlertDetailClient({ id }: { id: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const item: AlertItem | undefined = useMemo(() => getMockAlerts().find((x) => x.id === id), [id]);
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
    // Usa QS que entiende el MapClient y resalta (focus)
    router.push(
      `/map?lat=${item.hive.lat}&lon=${item.hive.lng}&name=${encodeURIComponent(
        item.hive.name
      )}&focus=${encodeURIComponent(item.hive.name)}`
    );
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

      {/* CAUSE */}
      <Section>
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-800">
            <Image src={ICONS[item.type]} alt="" width={22} height={22} />
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold">{tv(t, 'alerts.detail.cause', 'Cause')}</p>
        <p className="mt-1 text-neutral-300">{item.title}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
          <Pill sev={item.severity} />
          <span>·</span>
          <span>{ago(item.createdAt, t)}</span>
        </div>
      </Section>

      {/* LINKED HIVE */}
      <Section>
        <p className="text-sm font-semibold">{tv(t, 'alerts.detail.linkedHive', 'Linked Hive')}</p>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-neutral-800 p-3">
          <Image src={HONEY_ICON} alt="" width={32} height={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{item.hive.name}</p>
            <p className="text-sm text-neutral-400">ID: {item.hive.id}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={goToHive}
          className="mt-3 h-11 w-full rounded-2xl bg-amber-400 font-semibold text-black ring-1 ring-black/5 hover:bg-amber-300"
        >
          {tv(t, 'alerts.detail.goHive', 'Go to Hive')}
        </button>
      </Section>

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
