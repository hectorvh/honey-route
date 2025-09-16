'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import Button from '@/components/ui/Button';
import CardShell from '@/components/shell/CardShell';
import NavTab from '@/components/NavTab';
import { useI18n } from '@/i18n/I18nProvider';
import type { ApiaryCard } from '@/data/apiaries.server';

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

export default function HivesClient({ cards }: { cards: ApiaryCard[] }) {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <CardShell
      heroSrc={null}
      headerLeft={<BrandMark />}
      headerRight={<LangToggle />}
      // 👇 nav fijo abajo dentro del CardShell
      footer={<NavTab active="home" />}
      // 👇 el contenido es scrollable; no hace falta gran padding inferior
      contentClassName="pb-2"
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">{t('home.title')}</h1>

      <div className="mt-4 space-y-4">
        {cards.map((c) => (
          <button
            key={c.id}
            className="relative h-40 w-full overflow-hidden rounded-2xl text-left shadow-lg ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            onClick={() => router.push(`/history/${c.id}`)}
          >
            {/* Imagen full-bleed */}
            <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
            {/* Degradado para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {/* Badge */}
            <div className="absolute right-3 top-3">
              <StatusBadge status={c.status} />
            </div>
            {/* Texto sobre la foto */}
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-lg font-semibold text-white drop-shadow-sm">{c.name}</p>
              <HiveCount count={c.hiveCount} />
            </div>
          </button>
        ))}

        {/* CTA principal */}
        <Button
          className="mt-2 h-12 w-full rounded-2xl"
          size="lg"
          onClick={() => router.push('/capture')}
        >
          <span className="inline-flex items-center gap-2">
            <Image src="/images/camera.png" alt="" width={18} height={18} />
            {t('home.capture')}
          </span>
        </Button>

        {/* Powered by (queda encima del nav fijo) */}
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
