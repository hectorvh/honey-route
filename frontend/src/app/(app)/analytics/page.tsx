// src/app/(app)/analytics/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';
import { getMockAlerts } from '@/app/(app)/alerts/mock';

type Hive = { id: string; apiary_id: string };

type HiveAlertAgg = {
  hiveId: string;
  hiveName: string;
  count: number;
};

const tv = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

function loadHives(): Hive[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('hr.hives');
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    if (!Array.isArray(parsed)) return [];

    const out: Hive[] = [];
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue;
      const o = item as Record<string, unknown>;

      const apiaryForItem =
        typeof o.apiary_id === 'string'
          ? (o.apiary_id as string)
          : typeof o.apiaryId === 'string'
            ? (o.apiaryId as string)
            : undefined;

      if (!apiaryForItem) continue;
      if (typeof o.id !== 'string') continue;

      out.push({
        id: o.id,
        apiary_id: apiaryForItem,
      });
    }
    return out;
  } catch {
    return [];
  }
}

function MetricCard(props: { label: string; value: string; hint?: string }) {
  const { label, value, hint } = props;
  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-50">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [hives, setHives] = useState<Hive[]>([]);

  // cargar hives de localStorage en client
  useEffect(() => {
    setHives(loadHives());
  }, []);

  // alerts vienen del mock
  const alerts = useMemo(() => getMockAlerts(), []);

  const totalHives = hives.length;
  const totalApiaries = useMemo(() => {
    const s = new Set<string>();
    for (const h of hives) s.add(h.apiary_id);
    return s.size || (totalHives > 0 ? 1 : 0);
  }, [hives, totalHives]);

  const totalAlerts = alerts.length;

  // Top hives por cantidad de alertas
  const topHives: HiveAlertAgg[] = useMemo(() => {
    const map = new Map<string, HiveAlertAgg>();
    for (const a of alerts) {
      const id = a.hive.id;
      const name = a.hive.name;
      const prev = map.get(id);
      if (prev) {
        prev.count += 1;
      } else {
        map.set(id, { hiveId: id, hiveName: name, count: 1 });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [alerts]);

  return (
    <CardShell
      headerLeft={<BrandMark />}
      headerRight={<LangToggle />}
      footer={<NavTab active="analytics" />}
      contentClassName="pb-20 pt-2"
    >
      <h1 className="text-[22px] font-extrabold tracking-tight">
        {tv(t, 'analytics.title', 'Analytics')}
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        {tv(t, 'analytics.subtitle', 'Overview of your apiaries, hives and alerts (demo data).')}
      </p>

      {/* KPIs globales */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label={tv(t, 'analytics.kpi.apiaries', 'Apiaries')}
            value={String(totalApiaries)}
            hint={tv(
              t,
              'analytics.kpi.apiariesHint',
              'Approx. counted from hives grouped by apiary.'
            )}
          />
          <MetricCard
            label={tv(t, 'analytics.kpi.hives', 'Hives')}
            value={String(totalHives)}
            hint={tv(t, 'analytics.kpi.hivesHint', 'Total hives stored locally on this device.')}
          />
        </div>

        <MetricCard
          label={tv(t, 'analytics.kpi.alerts', 'Alerts (demo)')}
          value={String(totalAlerts)}
          hint={tv(
            t,
            'analytics.kpi.alertsHint',
            'Based on mock alerts currently loaded in the app.'
          )}
        />
      </div>

      {/* Top hives por alertas */}
      <div className="mt-5 rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
        <p className="text-sm font-semibold text-neutral-50">
          {tv(t, 'analytics.topHives.title', 'Top hives by alerts')}
        </p>
        {topHives.length === 0 && (
          <p className="mt-2 text-xs text-neutral-400">
            {tv(
              t,
              'analytics.topHives.empty',
              'No alerts yet. Once alerts are generated, you will see the most affected hives here.'
            )}
          </p>
        )}

        {topHives.length > 0 && (
          <ul className="mt-3 space-y-2">
            {topHives.map((h) => (
              <li
                key={h.hiveId}
                className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-neutral-50">{h.hiveName}</p>
                  <p className="text-xs text-neutral-400">
                    {h.count}{' '}
                    {h.count === 1
                      ? tv(t, 'analytics.topHives.alert', 'alert')
                      : tv(t, 'analytics.topHives.alerts', 'alerts')}
                  </p>
                </div>
                <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-300">
                  {h.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA → Alerts */}
      <div className="mt-4">
        <Button
          className="h-11 w-full rounded-2xl"
          size="lg"
          onClick={() => router.push('/alerts')}
        >
          {tv(t, 'analytics.cta.alerts', 'Open Alerts')}
        </Button>
      </div>
    </CardShell>
  );
}
