//frontend/src/app/(app)/settings/subscriptions/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

type PlanKey = 'hobby' | 'pro' | 'team';

type TFunc = (k: string, p?: Record<string, unknown>) => string;

// --- helper de interpolación tipado (sin any) ---
function replaceParams(s: string, p?: Record<string, unknown>) {
  if (!p) return s;
  return s.replace(/{{\s*(\w+)\s*}}/g, (_match: string, key: string) => String(p[key] ?? ''));
}

const tv = (t: TFunc, k: string, fb: string, p?: Record<string, unknown>) => {
  const v = t(k, p);
  return v === k ? replaceParams(fb, p) : v;
};

function usePlanState() {
  const [plan, setPlan] = useState<PlanKey>('hobby');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hr.plan') as PlanKey | null;
      if (raw === 'hobby' || raw === 'pro' || raw === 'team') setPlan(raw);
    } catch {}
  }, []);
  const choose = (p: PlanKey) => {
    try {
      localStorage.setItem('hr.plan', p);
    } catch {}
    setPlan(p);
  };
  return { plan, choose };
}

type Feature = { id: string; value: string };
type Plan = {
  key: PlanKey;
  price: string; // “$0”, “$9”
  period: string; // “/mo”
  tagline: string;
  features: Feature[];
  highlighted?: boolean;
};

function PlanCard({
  p,
  current,
  onSelect,
  t,
}: {
  p: Plan;
  current: boolean;
  onSelect: () => void;
  t: TFunc;
}) {
  return (
    <div
      className={`relative rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5 ${
        p.highlighted ? 'outline outline-2 outline-amber-400/60' : ''
      }`}
    >
      {p.highlighted && (
        <span className="absolute -top-2 right-3 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-black shadow">
          {tv(t, 'settings.subs.recommended', 'Recommended')}
        </span>
      )}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg font-bold capitalize">
            {tv(t, `settings.subs.plan.${p.key}.name`, p.key)}
          </h3>
          <p className="mt-1 text-sm text-neutral-400">{p.tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold">{p.price}</p>
          <p className="text-xs text-neutral-400">{p.period}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {p.features.map((f) => (
          <li key={f.id} className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-600/30">
              ✓
            </span>
            <span>
              {tv(t, `settings.subs.features.${f.id}`, f.id)}{' '}
              <span className="text-neutral-400">{f.value}</span>
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        className={`mt-4 w-full rounded-2xl ${
          current ? 'bg-neutral-800 text-white hover:bg-neutral-800' : ''
        }`}
        disabled={current}
      >
        {current
          ? tv(t, 'settings.subs.current', 'Current plan')
          : tv(t, 'settings.subs.select', 'Choose plan')}
      </Button>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { t } = useI18n();
  const { plan, choose } = usePlanState();

  const plans: Plan[] = useMemo(() => {
    return [
      {
        key: 'hobby',
        price: tv(t, 'settings.subs.price.free', '$0'),
        period: tv(t, 'settings.subs.perMonth', '/mo'),
        tagline: tv(t, 'settings.subs.plan.hobby.tag', 'For personal use and learning'),
        features: [
          { id: 'images', value: tv(t, 'settings.subs.features.images.val.hobby', '50/mo') },
          { id: 'storage', value: tv(t, 'settings.subs.features.storage.val.hobby', '1 GB') },
          { id: 'alerts', value: tv(t, 'settings.subs.features.alerts.val.hobby', 'Basic') },
          { id: 'offline', value: tv(t, 'settings.subs.features.offline.val', 'Yes') },
        ],
      },
      {
        key: 'pro',
        price: tv(t, 'settings.subs.price.pro', '$9'),
        period: tv(t, 'settings.subs.perMonth', '/mo'),
        tagline: tv(t, 'settings.subs.plan.pro.tag', 'Best for active beekeepers'),
        highlighted: true,
        features: [
          { id: 'images', value: tv(t, 'settings.subs.features.images.val.pro', '500/mo') },
          { id: 'storage', value: tv(t, 'settings.subs.features.storage.val.pro', '10 GB') },
          { id: 'alerts', value: tv(t, 'settings.subs.features.alerts.val.pro', 'Smart') },
          {
            id: 'mapLayers',
            value: tv(t, 'settings.subs.features.mapLayers.val', 'Floral & risk'),
          },
          { id: 'offline', value: tv(t, 'settings.subs.features.offline.val', 'Yes') },
        ],
      },
      {
        key: 'team',
        price: tv(t, 'settings.subs.price.team', '$29'),
        period: tv(t, 'settings.subs.perMonth', '/mo'),
        tagline: tv(t, 'settings.subs.plan.team.tag', 'For teams and cooperatives'),
        features: [
          { id: 'images', value: tv(t, 'settings.subs.features.images.val.team', '5k/mo') },
          { id: 'storage', value: tv(t, 'settings.subs.features.storage.val.team', '100 GB') },
          { id: 'alerts', value: tv(t, 'settings.subs.features.alerts.val.team', 'Advanced') },
          { id: 'multiUser', value: tv(t, 'settings.subs.features.multiUser.val', 'Up to 10') },
          {
            id: 'mapLayers',
            value: tv(t, 'settings.subs.features.mapLayers.val', 'Floral & risk'),
          },
          { id: 'offline', value: tv(t, 'settings.subs.features.offline.val', 'Yes') },
        ],
      },
    ];
  }, [t]);

  return (
    <CardShell
      headerLeft={
        <div className="flex items-center gap-2">
          <BackBtn />
          <BrandMark />
        </div>
      }
      headerRight={<LangToggle />}
      contentClassName="pb-28 pt-2"
      footer={<NavTab active="settings" />}
    >
      <h1 className="text-[22px] font-bold">
        {tv(t, 'settings.subs.page.title', 'Subscriptions')}
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        {tv(t, 'settings.subs.page.subtitle', 'Pick a plan. You can change anytime.')}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {plans.map((p) => (
          <PlanCard
            key={p.key}
            p={p}
            current={plan === p.key}
            onSelect={() => choose(p.key)}
            t={t}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500">
        {tv(t, 'settings.subs.disclaimer', 'Prices shown are demo only. Billing coming soon.')}
      </p>
    </CardShell>
  );
}
