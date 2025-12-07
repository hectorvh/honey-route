'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    healthy: {
      text:
        t('home.status.healthy') === 'home.status.healthy' ? 'Healthy' : t('home.status.healthy'),
      cls: 'bg-emerald-500/90 text-white',
    },
    attention: {
      text:
        t('home.status.warning') === 'home.status.warning' ? 'Warning' : t('home.status.warning'),
      cls: 'bg-amber-400 text-black',
    },
    critical: {
      text:
        t('home.status.critical') === 'home.status.critical'
          ? 'Critical'
          : t('home.status.critical'),
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

// Tipos de lo que guardamos en localStorage
type StoredApiary = {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
};

type StoredHive = {
  apiaryId?: string;
};

export default function ApiariesClient({ cards }: { cards: ApiaryCard[] }) {
  const { t } = useI18n();
  const router = useRouter();

  const [allCards, setAllCards] = useState<ApiaryCard[]>(cards);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setAllCards(cards);
      return;
    }

    try {
      const rawApiaries = localStorage.getItem('hr.apiaries');
      const rawHives = localStorage.getItem('hr.hives');

      let localApiaries: StoredApiary[] = [];
      if (rawApiaries) {
        const parsed = JSON.parse(rawApiaries);
        if (Array.isArray(parsed)) localApiaries = parsed as StoredApiary[];
      }

      let hives: StoredHive[] = [];
      if (rawHives) {
        const parsed = JSON.parse(rawHives);
        if (Array.isArray(parsed)) hives = parsed as StoredHive[];
      }

      const locals: ApiaryCard[] = localApiaries
        .map((a) => {
          if (!a || typeof a.id !== 'string') return null;

          const hiveCount = Array.isArray(hives)
            ? hives.filter((h) => h && h.apiaryId === a.id).length
            : 0;

          const card: ApiaryCard = {
            id: a.id,
            name: a.name ?? 'My Apiary',
            hiveCount,
            status: 'healthy', // default para apiarios locales
            imageUrl: a.imageUrl ?? undefined,
          };

          return card;
        })
        .filter((x): x is ApiaryCard => x !== null);

      const existingIds = new Set(cards.map((c) => c.id));
      const onlyNew = locals.filter((c) => !existingIds.has(c.id));

      setAllCards([...cards, ...onlyNew]);
    } catch {
      setAllCards(cards);
    }
  }, [cards]);

  const goCreateApiary = () => router.push('/apiaries/new');
  const goQuickAnalysis = () => router.push('/apiaries/quick-analysis');
  const goTutorial = () => router.push('/tutorial');

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
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-12 w-full rounded-2xl bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
            size="lg"
            onClick={goCreateApiary}
          >
            {tv(t, 'home.newApiary', 'New Apiary')}
          </Button>

          <Button className="h-12 w-full rounded-2xl" size="lg" onClick={goQuickAnalysis}>
            {tv(t, 'home.quickAnalysis', 'Quick Analysis')}
          </Button>
        </div>

        <Button
          className="h-11 w-full rounded-2xl text-sm"
          size="md"
          variant="ghost"
          onClick={goTutorial}
        >
          {tv(t, 'home.tutorial', 'Tutorial')}
        </Button>
      </div>

      {/* Lista de apiarios */}
      <div className="mt-4 space-y-4">
        {allCards.map((c) => (
          <button
            key={c.id}
            className="relative h-40 w-full overflow-hidden rounded-2xl text-left shadow-lg ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            onClick={() => router.push(`/apiaries/${encodeURIComponent(c.id)}`)}
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

        {allCards.length === 0 && (
          <div className="rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-300 ring-1 ring-black/5">
            {tv(t, 'home.empty', 'No apiaries yet. Create your first one!')}
          </div>
        )}

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
