//frontend/src/app/(app)/apiaries/[apiaryId]/ApiaryDetailClient.tsx
'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import BackBtn from '@/components/BackBtn';
import NavTab from '@/components/NavTab';
import { useI18n } from '@/i18n/I18nProvider';
import { getMockAlerts } from '@/app/(app)/alerts/mock';

type TabKey = 'status' | 'history' | 'recs' | 'media' | 'evidence';
type Severity = 'ok' | 'warn' | 'crit';
type KPI = {
  key: string;
  label: string;
  value: number;
  sev: Severity;
  icon: string;
  hint?: string;
};
type Hive = { id: string; apiary_id: string; label: string; lat?: number; lng?: number };

type HealthState = 'healthy' | 'attention' | 'critical';
type OperationalState = 'active' | 'paused';

type EnvMetrics = {
  temp: number;
  humidity: number;
  co2: number;
  no2: number;
  pm25: number;
  pm10: number;
};

const tv = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

/* ---------------- data loaders ---------------- */
function loadApiary(apiaryId: string) {
  try {
    const raw = localStorage.getItem('hr.apiary');
    if (!raw) return null;
    const a = JSON.parse(raw) as { id: string; name: string; location?: string | null };
    return a.id === apiaryId ? a : null;
  } catch {
    return null;
  }
}
function loadHives(apiaryId: string): Hive[] {
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

      if (apiaryForItem !== apiaryId) continue;
      if (typeof o.id !== 'string' || typeof o.label !== 'string') continue;

      const lat = typeof o.lat === 'number' ? o.lat : undefined;
      const lng = typeof o.lng === 'number' ? o.lng : undefined;

      out.push({
        id: o.id,
        apiary_id: apiaryForItem,
        label: o.label,
        lat,
        lng,
      });
    }
    return out;
  } catch {
    return [];
  }
}
function defaultFromAlerts(apiaryId: string) {
  const uniq = new Map<string, Hive>();
  for (const a of getMockAlerts()) {
    uniq.set(a.hive.id, {
      id: a.hive.id,
      apiary_id: apiaryId,
      label: a.hive.name,
      lat: a.hive.lat,
      lng: a.hive.lng,
    });
  }
  return { name: "Azul's Bees", hives: Array.from(uniq.values()) };
}

/* ---------------- tiny charts (SVG puros) ---------------- */
function Sparkline({ data, h = 42, w = 140 }: { data: number[]; h?: number; w?: number }) {
  if (!data.length) return null;
  const min = Math.min(...data),
    max = Math.max(...data);
  const xStep = w / (data.length - 1 || 1);
  const y = (v: number) => h - (max === min ? h / 2 : ((v - min) / (max - min)) * (h - 6)) - 3;
  const d = data.map((v, i) => `${i ? 'L' : 'M'} ${i * xStep},${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function RadialGauge({
  value,
  min = 0,
  max = 100,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const R = 26,
    C = 2 * Math.PI * R;
  const off = C * (1 - pct);
  const color = value >= 6 ? '#ef4444' : value >= 3 ? '#f59e0b' : '#10b981';
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={R} stroke="#1f2937" strokeWidth="6" fill="none" />
        <circle
          cx="32"
          cy="32"
          r={R}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={C.toFixed(2)}
          strokeDashoffset={off.toFixed(2)}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="12"
          fill="white"
        >
          {value.toFixed(1)}%
        </text>
      </svg>
      {label && <div className="text-sm">{label}</div>}
    </div>
  );
}
function DonutGauge({
  value,
  max = 30,
  unit = 'kg',
}: {
  value: number;
  max?: number;
  unit?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const R = 26,
    C = 2 * Math.PI * R;
  const off = C * (1 - pct);
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="text-amber-400">
      <circle cx="32" cy="32" r={R} stroke="#1f2937" strokeWidth="6" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={R}
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeDasharray={C.toFixed(2)}
        strokeDashoffset={off.toFixed(2)}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
      <text
        x="50%"
        y="48%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="12"
        fill="white"
      >
        {value.toFixed(1)}
      </text>
      <text
        x="50%"
        y="62%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="9"
        fill="#9ca3af"
      >
        {unit}
      </text>
    </svg>
  );
}
function BulletBar({
  value,
  min,
  max,
  target,
  unit = '',
  bands = [],
}: {
  value: number;
  min: number;
  max: number;
  target?: number;
  unit?: string;
  bands?: Array<{ upTo: number; cls: string }>;
}) {
  const pct = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div className="relative h-4 w-full overflow-hidden rounded bg-neutral-800">
        {bands.map((b, i) => (
          <div
            key={i}
            className={`${b.cls} h-full absolute left-0`}
            style={{ width: pct(b.upTo) }}
          />
        ))}
        <div className="absolute top-0 h-full bg-amber-400" style={{ width: pct(value) }} />
        {target !== undefined && (
          <div className="absolute top-[-2px] w-0.5 h-5 bg-white" style={{ left: pct(target) }} />
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs text-neutral-400">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {value.toFixed(1)}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
function MiniBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px]">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-[8px] rounded bg-rose-500/80"
          style={{ height: `${(v / max) * 32 + 4}px` }}
        />
      ))}
    </div>
  );
}
function ThermoBar({ value, min = 0, max = 50 }: { value: number; min?: number; max?: number }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return (
    <div className="flex items-center gap-2">
      <div className="h-10 w-3 rounded-full bg-neutral-800 overflow-hidden">
        <div className="w-full bg-orange-400" style={{ height: `${pct * 100}%` }} />
      </div>
      <span className="text-sm text-neutral-300">{value.toFixed(1)}°C</span>
    </div>
  );
}
function DualProgress({
  a,
  b,
  labelA,
  labelB,
  unitA = '',
  unitB = '',
}: {
  a: number;
  b: number;
  labelA: string;
  labelB: string;
  unitA?: string;
  unitB?: string;
}) {
  const Bar = ({ v, unit, color }: { v: number; unit: string; color: string }) => (
    <div className="w-full">
      <div className="h-2 rounded bg-neutral-800 overflow-hidden">
        <div className="h-full" style={{ width: `${v}%`, backgroundColor: color }} />
      </div>
      <span className="mt-1 block text-xs text-neutral-400">
        {v.toFixed(0)}
        {unit}
      </span>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="text-xs text-neutral-400">{labelA}</p>
        <Bar v={a} unit={unitA} color="#22c55e" />
      </div>
      <div>
        <p className="text-xs text-neutral-400">{labelB}</p>
        <Bar v={b} unit={unitB} color="#60a5fa" />
      </div>
    </div>
  );
}

/* ---------- icon fallback to avoid 404 spam ---------- */
function KpiIcon({ src, emoji }: { src: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="text-xl">{emoji}</span>
  ) : (
    <Image
      src={src}
      alt=""
      width={18}
      height={18}
      className="brightness-0"
      onError={() => setFailed(true)}
    />
  );
}

/* ---------------- small UI pieces ---------------- */
function KpiCard({ k }: { k: KPI }) {
  const color =
    k.sev === 'ok'
      ? 'bg-emerald-500/90 text-white'
      : k.sev === 'warn'
        ? 'bg-amber-400 text-black'
        : 'bg-rose-500 text-white';
  const emojiMap: Record<string, string> = {
    status: '📊',
    health: '🩺',
    queen: '👑',
    brood: '🐣',
    honey: '🍯',
    pollen: '🌿',
    population: '🐝',
    disease: '🧫',
  };
  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/90">
            <KpiIcon src={k.icon} emoji={emojiMap[k.key] ?? '📈'} />
          </div>
          <p className="font-semibold">{k.label}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
          {k.value}%
        </span>
      </div>
      {k.hint && <p className="mt-2 text-xs text-neutral-400">{k.hint}</p>}
    </div>
  );
}
type Point = { t: string; v: number };
function HistoryRow({ title, unit, data }: { title: string; unit: string; data: Point[] }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-neutral-900 p-3 ring-1 ring-black/5">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-neutral-400">
          {data[data.length - 1]?.v}
          {unit} · {data[0]?.t}–{data[data.length - 1]?.t}
        </p>
      </div>
      <div className="text-amber-400">
        <Sparkline data={data.map((d) => d.v)} />
      </div>
    </div>
  );
}

/* ---------------- Tabs pillbar (scrollable) ---------------- */
function Tabs({ active, onTab }: { active: TabKey; onTab: (k: TabKey) => void }) {
  const { t } = useI18n();
  const items: { k: TabKey; label: string }[] = [
    { k: 'status', label: tv(t, 'apiary.tabs.status', 'Status') },
    { k: 'history', label: tv(t, 'apiary.tabs.history', 'History') },
    { k: 'recs', label: tv(t, 'apiary.tabs.recs', 'Recommendations') },
    { k: 'media', label: tv(t, 'apiary.tabs.media', 'Media') },
    { k: 'evidence', label: tv(t, 'apiary.tabs.evidence', 'Evidence') },
  ];
  return (
    <div className="-mx-6 mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
      <div className="px-6 inline-flex gap-2 min-w-max">
        {items.map((it) => (
          <button
            key={it.k}
            onClick={() => onTab(it.k)}
            className={`rounded-full px-3 py-2 text-sm ring-1 ring-black/5 whitespace-nowrap ${
              active === it.k
                ? 'bg-amber-400 text-black font-semibold'
                : 'bg-neutral-900 text-neutral-200'
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

/* ----------- Badges + bloques v1.2 (health / hives / env / sensor setup) ----------- */
function HealthStatusBadge({ status }: { status: HealthState }) {
  const { t } = useI18n();
  const map: Record<HealthState, { text: string; cls: string }> = {
    healthy: {
      text: tv(t, 'home.status.healthy', 'Healthy'),
      cls: 'bg-emerald-500/90 text-white',
    },
    attention: {
      text: tv(t, 'home.status.warning', 'Warning'),
      cls: 'bg-amber-400 text-black',
    },
    critical: {
      text: tv(t, 'home.status.critical', 'Critical'),
      cls: 'bg-rose-500 text-white',
    },
  };
  const v = map[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow ${v.cls}`}>
      {v.text}
    </span>
  );
}

function OperationalBadge({ state }: { state: OperationalState }) {
  const { t } = useI18n();
  const key = state === 'active' ? 'apiary.active' : 'apiary.paused';
  const label = tv(t, key, state === 'active' ? 'Active' : 'Paused');
  const cls =
    state === 'active'
      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
      : 'bg-neutral-900 text-neutral-300 border border-neutral-700';

  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

function HiveList({ hives }: { hives: Hive[] }) {
  const { t } = useI18n();
  if (!hives.length) {
    return (
      <section className="mt-4 rounded-2xl bg-neutral-900/80 p-3 ring-1 ring-black/5">
        <p className="text-sm text-neutral-300">
          {tv(t, 'apiary.hivesEmpty', 'No hives yet in this apiary.')}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl bg-neutral-900/80 p-3 ring-1 ring-black/5">
      <h2 className="text-sm font-semibold text-neutral-100">
        {tv(t, 'apiary.hivesTitle', 'Hives')}
      </h2>
      <ul className="mt-2 space-y-2">
        {hives.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm text-neutral-100"
          >
            <span>{h.label}</span>
            {/* Podríamos mapear estado por hive más adelante; por ahora usamos Healthy */}
            <span className="rounded-full bg-emerald-500/80 px-2 py-0.5 text-[11px] font-semibold">
              {tv(t, 'home.status.healthy', 'Healthy')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EnvDashboard({ metrics }: { metrics: EnvMetrics }) {
  const { t } = useI18n();
  const items = [
    { key: 'temp', label: 'Temp', value: metrics.temp, unit: '°C' },
    { key: 'humidity', label: 'Humidity', value: metrics.humidity, unit: '%' },
    { key: 'co2', label: 'CO₂', value: metrics.co2, unit: 'ppm' },
    { key: 'no2', label: 'NO₂', value: metrics.no2, unit: 'ppm' },
    { key: 'pm25', label: 'PM2.5', value: metrics.pm25, unit: 'µg/m³' },
    { key: 'pm10', label: 'PM10', value: metrics.pm10, unit: 'µg/m³' },
  ];

  return (
    <section className="mt-4 rounded-2xl bg-neutral-900/80 p-3 ring-1 ring-black/5">
      <h2 className="text-sm font-semibold text-neutral-100">
        {tv(t, 'apiary.dashboardTitle', 'Environment')}
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map((m) => (
          <div key={m.key} className="rounded-xl bg-black/20 px-3 py-2 text-xs text-neutral-200">
            <p className="text-[11px] uppercase tracking-wide text-neutral-400">{m.label}</p>
            <p className="mt-1 text-sm font-semibold">
              {m.value != null ? `${m.value.toFixed(1)} ${m.unit}` : '—'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- helpers (mocks) ---------------- */
function ts(days = 14, min = 0, max = 100): Point[] {
  const out: Point[] = [];
  const now = Date.now();
  let v = (min + max) / 2;
  for (let i = days - 1; i >= 0; i--) {
    v = Math.min(max, Math.max(min, v + (Math.random() * 12 - 6)));
    out.push({ t: new Date(now - i * 86400000).toISOString().slice(5, 10), v: Math.round(v) });
  }
  return out;
}
function buildApiaryHistory(hivesCount: number) {
  const bump = Math.min(6, hivesCount);
  return {
    varroa: ts(14, 1, 7 + bump),
    temp: ts(14, 28, 38 + bump),
    humidity: ts(14, 40, 78),
    weight: ts(14, 18 + bump * 0.5, 27 + bump * 0.6),
    flight: ts(14, 120, 320 + 10 * bump),
    mortality: ts(14, 80, 320),
  };
}
function buildKPIs(hives: Hive[], t: (k: string) => string): KPI[] {
  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
  const sev = (v: number): Severity => (v >= 75 ? 'ok' : v >= 50 ? 'warn' : 'crit');
  const icon = (name: string) =>
    (
      ({
        status: '/images/status.png',
        health: '/images/health.png',
        queen: '/images/queen.png',
        brood: '/images/brood.png',
        honey: '/images/honey.png',
        pollen: '/images/pollen.png',
        population: '/images/bees.png',
        disease: '/images/bug.png',
      }) as Record<string, string>
    )[name];

  const n = Math.max(1, hives.length);
  const vals = {
    status: clamp(88 + n),
    health: clamp(86 + n),
    queen: clamp(96),
    brood: clamp(84),
    honey: clamp(76),
    pollen: clamp(74),
    population: clamp(80),
    disease: clamp(97),
  };

  const rows: Array<[string, string, number, string?]> = [
    ['status', tv(t, 'hive.kpi.status', 'Status'), vals.status, tv(t, 'hive.kpi.active', 'Active')],
    ['health', tv(t, 'hive.kpi.health', 'Health'), vals.health],
    [
      'queen',
      tv(t, 'hive.kpi.queen', 'Queen Presence'),
      vals.queen,
      tv(t, 'hive.kpi.lastInspection100', '100% last inspection'),
    ],
    ['brood', tv(t, 'hive.kpi.brood', 'Brood Pattern'), vals.brood],
    ['honey', tv(t, 'hive.kpi.honey', 'Honey Stores'), vals.honey],
    ['pollen', tv(t, 'hive.kpi.pollen', 'Pollen Stores'), vals.pollen],
    ['population', tv(t, 'hive.kpi.population', 'Bee Population'), vals.population],
    [
      'disease',
      tv(t, 'hive.kpi.disease', 'Disease/Pest'),
      vals.disease,
      tv(t, 'hive.kpi.noneDetected', 'None detected'),
    ],
  ];

  return rows.map(([key, label, value, hint]) => ({
    key,
    label,
    value,
    hint,
    sev: sev(value),
    icon: icon(key),
  }));
}

/* ---------------- Before/After slider ---------------- */
function BeforeAfter({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) {
  const [pct, setPct] = useState(50);
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5">
      <Image src={beforeSrc} alt="" width={1200} height={800} className="w-full h-auto" />
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${pct}%` }}
      >
        <Image src={afterSrc} alt="" width={1200} height={800} className="w-full h-auto" />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => setPct(Number(e.currentTarget.value))}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[66%]"
      />
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function ApiaryDetailClient({ apiaryId }: { apiaryId: string }) {
  const { t } = useI18n();
  const router = useRouter();

  // sincroniza apiario activo
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hr.apiary');
      const saved = raw ? (JSON.parse(raw) as { id?: string; name?: string }) : null;
      if (!saved || saved.id !== apiaryId) {
        const fallback = { id: apiaryId, name: 'Apiary' };
        localStorage.setItem('hr.apiary', JSON.stringify(saved ?? fallback));
      }
    } catch {}
  }, [apiaryId]);

  const apiary = useMemo(() => loadApiary(apiaryId), [apiaryId]);
  const fallback = useMemo(() => defaultFromAlerts(apiaryId), [apiaryId]);
  const hives = useMemo(() => {
    const hs = loadHives(apiaryId);
    return hs.length ? hs : fallback.hives;
  }, [apiaryId, fallback]);

  const name = apiary?.name ?? fallback.name;
  const [tab, setTab] = useState<TabKey>('status');

  const kpis = useMemo(() => buildKPIs(hives, t), [hives, t]);
  const hist = useMemo(() => buildApiaryHistory(hives.length), [hives.length]);

  const mediaItems = useMemo(() => {
    try {
      const galleryKey = `media.${apiaryId}`;
      const extraRaw = localStorage.getItem(galleryKey);
      const extra = extraRaw ? (JSON.parse(extraRaw) as string[]) : [];
      return [...extra, '/images/apiary1.png', '/images/apiary2.png', '/images/apiary3.png'];
    } catch {
      return ['/images/apiary1.png', '/images/apiary2.png', '/images/apiary3.png'];
    }
  }, [apiaryId]);

  const imgAfter =
    (typeof window !== 'undefined' && sessionStorage.getItem('lastCaptureDataURL')) ||
    '/images/after.png';
  const imgBefore = '/images/before.png';

  const adv = useMemo(() => {
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    return {
      varroaPct: rnd(2.3, 6.8),
      estYield: rnd(10, 22), // kg/colony
      weightNow: rnd(18, 28), // kg
      weightTarget: 26,
      mortality7: Array.from({ length: 10 }, () => Math.round(rnd(80, 320))),
      tempNow: rnd(31, 38),
      co2ppm: rnd(800, 1800),
      o2pct: rnd(17, 21),
      pesticidePpb: rnd(0, 3.2),
    };
  }, [hives.length]);

  const envMetrics: EnvMetrics = useMemo(
    () => ({
      temp: adv.tempNow,
      humidity: hist.humidity[hist.humidity.length - 1]?.v ?? 0,
      co2: adv.co2ppm,
      no2: Math.round(adv.co2ppm / 18),
      pm25: Math.round(10 + adv.pesticidePpb * 4),
      pm10: Math.round(18 + adv.pesticidePpb * 5),
    }),
    [adv, hist]
  );

  // derivar health_state y last_update a partir de los KPIs/hist
  let derivedHealth: HealthState = 'healthy';
  if (kpis.some((k) => k.sev === 'crit')) derivedHealth = 'critical';
  else if (kpis.some((k) => k.sev === 'warn')) derivedHealth = 'attention';

  const health: HealthState = derivedHealth;
  const operational: OperationalState = 'active'; // más adelante podemos leerlo de BD
  const lastUpdateLabel =
    hist.temp[hist.temp.length - 1]?.t ?? new Date().toISOString().slice(0, 10);

  // etiqueta “N hives” con i18n
  const hivesCountRaw = t('home.hivesCount');
  const hivesCountText =
    hivesCountRaw === 'home.hivesCount'
      ? `${hives.length} hives`
      : hivesCountRaw.replace('{{count}}', String(hives.length));

  const goEdit = () => router.push(`/apiaries/${encodeURIComponent(apiaryId)}/edit`);

  return (
    <CardShell
      headerLeft={
        <div className="flex items-center gap-2">
          <BackBtn />
          <BrandMark />
        </div>
      }
      headerRight={<LangToggle />}
      contentClassName="pb-24 pt-2"
      footer={<NavTab active="home" />}
    >
      {/* Header v1.2 con estado del apiario */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-white">{name}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {tv(t, 'apiary.details.title', 'Apiary Details')} · {hivesCountText}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <OperationalBadge state={operational} />
            <HealthStatusBadge status={health} />
            <span>
              {tv(t, 'apiary.lastUpdate', 'Last update')}: {lastUpdateLabel}
            </span>
          </div>
        </div>
        <button
          onClick={goEdit}
          className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-100 ring-1 ring-black/40 hover:bg-neutral-800"
        >
          {tv(t, 'apiary.edit', 'Edit')}
        </button>
      </header>

      {/* Acciones del apiario */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => router.push('/hives/new')}
          className="h-11 rounded-2xl bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
        >
          + {tv(t, 'home.addHive', 'Add Hive')}
        </button>
        <button
          onClick={() =>
            router.push(`/apiaries/quick-analysis?apiaryId=${encodeURIComponent(apiaryId)}`)
          }
          className="h-11 rounded-2xl bg-amber-400 font-semibold text-black hover:bg-amber-300"
        >
          {tv(t, 'home.quickAnalysis', 'Quick Analysis')}
        </button>
      </div>

      {/* Bloque Hives v1.2 */}
      <HiveList hives={hives} />

      {/* Bloque Dashboard ambiental v1.2 */}
      <EnvDashboard metrics={envMetrics} />

      {/* Bloque Sensor Setup v1.2 */}
      <section className="mt-4 rounded-2xl bg-neutral-900/80 p-3 ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-neutral-100">
              {tv(t, 'apiary.sensorSetup.title', 'Sensor Setup')}
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {tv(
                t,
                'apiary.sensorSetup.desc',
                'Configure which sensors are active and their thresholds.'
              )}
            </p>
          </div>
          <button
            onClick={() => router.push(`/sensor-setup?apiaryId=${encodeURIComponent(apiaryId)}`)}
            className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-black hover:bg-white"
          >
            {tv(t, 'apiary.sensorSetup.cta', 'Configure')}
          </button>
        </div>
      </section>

      {/* Tabs (Status / History / Recs / Media / Evidence) */}
      <Tabs active={tab} onTab={setTab} />

      {/* STATUS */}
      {tab === 'status' && (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {kpis.map((k) => (
            <KpiCard key={k.key} k={k} />
          ))}

          {/* Advanced KPIs */}
          <div className="mt-2 rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
            <p className="text-sm font-semibold mb-3">
              {tv(t, 'hive.advanced.title', 'Advanced KPIs')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-800 p-3">
                <p className="text-xs text-neutral-400 mb-1">
                  {tv(t, 'hive.advanced.varroa', 'Varroa Infestation')}
                </p>
                <RadialGauge
                  value={adv.varroaPct}
                  label={tv(t, 'hive.advanced.varroaHint', 'Action < 3–5%')}
                />
              </div>
              <div className="rounded-xl bg-neutral-800 p-3">
                <p className="text-xs text-neutral-400 mb-1">
                  {tv(t, 'hive.advanced.yield', 'Est. Honey Yield')}
                </p>
                <div className="flex items-center gap-3">
                  <DonutGauge value={adv.estYield} max={30} unit="kg" />
                  <span className="text-xs text-neutral-400">
                    {tv(t, 'hive.advanced.yieldTarget', 'Target 30kg')}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-neutral-800 p-3">
                <p className="text-xs text-neutral-400 mb-2">
                  {tv(t, 'hive.advanced.weight', 'Hive Weight')}
                </p>
                <BulletBar
                  value={adv.weightNow}
                  min={15}
                  max={32}
                  target={adv.weightTarget}
                  unit="kg"
                  bands={[
                    { upTo: 20, cls: 'bg-rose-500/30' },
                    { upTo: 26, cls: 'bg-emerald-500/30' },
                    { upTo: 32, cls: 'bg-amber-400/30' },
                  ]}
                />
              </div>
              <div className="rounded-xl bg-neutral-800 p-3">
                <p className="text-xs text-neutral-400 mb-2">
                  {tv(t, 'hive.advanced.mortality', 'Daily Mortality')}
                </p>
                <MiniBars data={adv.mortality7} />
              </div>
              <div className="rounded-xl bg-neutral-800 p-3">
                <p className="text-xs text-neutral-400 mb-2">
                  {tv(t, 'hive.advanced.temp', 'Nest Temperature')}
                </p>
                <ThermoBar value={adv.tempNow} min={25} max={45} />
              </div>
              <div className="rounded-xl bg-neutral-800 p-3">
                <p className="text-xs text-neutral-400 mb-2">
                  {tv(t, 'hive.advanced.gases', 'CO₂ / O₂ Levels')}
                </p>
                <DualProgress
                  a={Math.min(100, adv.co2ppm / 20)}
                  b={Math.min(100, (adv.o2pct / 21) * 100)}
                  labelA="CO₂ (ppm %/100)"
                  labelB="O₂ (%)"
                  unitA="%"
                  unitB="%"
                />
              </div>
              <div className="col-span-2 rounded-xl bg-neutral-800 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-400">
                    {tv(t, 'hive.advanced.agrochem', 'Agrochemical Exposure')}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      adv.pesticidePpb > 2
                        ? 'bg-rose-500 text-white'
                        : adv.pesticidePpb > 0.5
                          ? 'bg-amber-400 text-black'
                          : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {adv.pesticidePpb.toFixed(1)} ppb
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div className="mt-4 grid grid-cols-1 gap-3">
          <HistoryRow
            title={tv(t, 'apiary.history.varroa', 'Varroa (%)')}
            unit="%"
            data={hist.varroa}
          />
          <HistoryRow
            title={tv(t, 'apiary.history.weight', 'Hive Weight (kg)')}
            unit="kg"
            data={hist.weight}
          />
          <HistoryRow
            title={tv(t, 'apiary.history.temp', 'Nest Temp (°C)')}
            unit="°C"
            data={hist.temp}
          />
          <HistoryRow
            title={tv(t, 'apiary.history.humidity', 'Humidity (%)')}
            unit="%"
            data={hist.humidity}
          />
          <HistoryRow
            title={tv(t, 'apiary.history.flight', 'Flight Activity')}
            unit=""
            data={hist.flight}
          />
        </div>
      )}

      {/* RECS */}
      {tab === 'recs' && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
            <p className="text-sm font-semibold">
              {tv(t, 'analysis.recs.title', 'Recommendations')}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                {tv(t, 'analysis.recs.varroaBody', 'Apply rotational mite treatment this week.')}
              </li>
              <li>
                {tv(t, 'analysis.recs.foodBody', 'Check food stores; supplement if < 6kg honey.')}
              </li>
              <li>
                {tv(
                  t,
                  'analysis.recs.inspectBody',
                  'Improve ventilation; monitor temperature spikes.'
                )}
              </li>
            </ul>
            <button
              className="mt-3 h-11 w-full rounded-2xl bg-amber-400 font-semibold text-black hover:bg-amber-300"
              onClick={() => {
                if (typeof window !== 'undefined')
                  location.href = '/apiaries/quick-analysis/analysis/recommendations';
              }}
            >
              {tv(t, 'hive.advanced.openRecs', 'Open Recommendations')}
            </button>
          </div>
        </div>
      )}

      {/* MEDIA */}
      {tab === 'media' && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {mediaItems.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-black/5"
            >
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* EVIDENCE */}
      {tab === 'evidence' && (
        <div className="mt-4 space-y-3">
          <BeforeAfter beforeSrc={imgBefore} afterSrc={String(imgAfter)} />
          <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5 text-sm text-neutral-300">
            {tv(t, 'hive.advanced.evidenceHint', 'Slide to compare “Before” vs “After”.')}
          </div>
        </div>
      )}
    </CardShell>
  );
}
