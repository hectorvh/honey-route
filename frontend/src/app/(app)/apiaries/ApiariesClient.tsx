'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import Button from '@/components/ui/Button';
import CardShell from '@/components/shell/CardShell';
import NavTab from '@/components/NavTab';
import { useI18n } from '@/i18n/I18nProvider';
import type { ApiaryCard } from './mock';

function StatusBadge({ status }: { status: ApiaryCard['status'] }) {
  const { t } = useI18n();
  const map: Record<ApiaryCard['status'], { text: string; cls: string }> = {
    healthy: { text: t('home.status.healthy'), cls: 'bg-emerald-500/90 text-white' },
    attention: { text: t('home.status.attention'), cls: 'bg-amber-400 text-black' },
    critical: { text: t('home.status.critical'), cls: 'bg-rose-500 text-white' },
  };
  const v = map[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow ${v.cls}`}>
      {v.text}
    </span>
  );
}

function hiveWord(count: number, locale: string) {
  const es = locale?.toLowerCase().startsWith('es');
  return es ? (count === 1 ? 'colmena' : 'colmenas') : count === 1 ? 'hive' : 'hives';
}

function HiveCount({ count }: { count: number }) {
  const { locale } = useI18n();
  return (
    <span className="text-sm text-neutral-200">
      {count} {hiveWord(count, locale)}
    </span>
  );
}

const tv = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

export default function ApiariesClient({ cards }: { cards: ApiaryCard[] }) {
  const { t } = useI18n();
  const router = useRouter();

  const goCreateApiary = () => router.push('/apiaries/new');

  const goCreateHive = () => {
    const apiary = typeof window !== 'undefined' ? localStorage.getItem('hr.apiary') : null;
    if (!apiary) return router.push('/apiaries/new');
    router.push('/hives/new');
  };

  const goCapture = () => router.push('/capture');

  return (
    <CardShell
      heroSrc={null}
      headerLeft={<BrandMark />}
      headerRight={<LangToggle />}
      footer={<NavTab active="home" />}
      contentClassName="pb-2"
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">
        {tv(t, 'home.title', 'My Apiaries')}
      </h1>

      {/* Acciones rápidas */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="h-12 w-full rounded-2xl" size="lg" onClick={goCreateHive}>
          + {tv(t, 'home.addHive', 'Add Hive')}
        </Button>
        <Button
          className="h-12 w-full rounded-2xl bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
          size="lg"
          onClick={goCreateApiary}
        >
          {tv(t, 'home.newApiary', 'New Apiary')}
        </Button>
      </div>

      {/* Lista de apiarios */}
      <div className="mt-4 space-y-4">
        {cards.map((c) => (
          <button
            key={c.id}
            className="relative h-40 w-full overflow-hidden rounded-2xl text-left shadow-lg ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            onClick={() => router.push(`/apiaries/${encodeURIComponent(c.id)}`)} // ✅ ruta correcta
          >
            {c.imageUrl ? (
              <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-950" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute right-3 top-3">
              <StatusBadge status={c.status} />
            </div>

            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-lg font-semibold text-white drop-shadow-sm">{c.name}</p>
              <HiveCount count={c.hiveCount} />
            </div>
          </button>
        ))}

        {cards.length === 0 && (
          <div className="rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-300 ring-1 ring-black/5">
            {tv(t, 'home.empty', 'No apiaries yet. Create your first one!')}
          </div>
        )}

        <Button className="mt-2 h-12 w-full rounded-2xl" size="lg" onClick={goCapture}>
          <span className="inline-flex items-center gap-2">
            <Image src="/images/camera.png" alt="" width={18} height={18} />
            {tv(t, 'home.capture', 'Capture / Analyze')}
          </span>
        </Button>

        <p className="mt-6 text-center text-xs text-neutral-500">
          <span className="text-neutral-400">{t('common.poweredBy')} </span>
          <span className="font-semibold tracking-wide">
            <span className="brand-outline brand-eco">Eco</span>
            <span className="brand-outline brand-ventus">Ventus</span>
          </span>
        </p>
      </div>
    </CardShell>
  );
}
