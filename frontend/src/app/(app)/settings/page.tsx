// frontend/src/app/(app)/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { supabaseBrowser } from '@/lib/supabase/client';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import Button from '@/components/ui/Button';
import NavTab from '@/components/NavTab';
import { useI18n } from '@/i18n/I18nProvider';

/* ---------- small icon helper ---------- */
function Icon({
  name,
  alt = '',
  size = 22,
}: {
  name: 'profile' | 'rule' | 'sync' | 'privacy' | 'lang' | 'moon' | 'help' | 'bell';
  alt?: string;
  size?: number;
}) {
  return (
    <Image
      src={`/images/${name}.png`}
      alt={alt}
      width={size}
      height={size}
      className="block"
      priority={false}
    />
  );
}

/* ---------- utils ---------- */
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);
  return [value, setValue] as const;
}

function Row({
  leading,
  title,
  subtitle,
  trailing,
}: {
  leading: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 ring-1 ring-black/5">
      <div className="shrink-0">{leading}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        {subtitle ? <p className="truncate text-sm text-neutral-400">{subtitle}</p> : null}
      </div>
      {trailing ?? <span className="text-neutral-500">›</span>}
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full p-0.5 transition ${
        checked ? 'bg-amber-400' : 'bg-neutral-700'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white transition ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SegmentedLang() {
  const { locale, setLocale, t } = useI18n();
  const isEN = locale.toLowerCase().startsWith('en');
  return (
    <div className="inline-flex rounded-full bg-neutral-800 p-1">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded-full text-sm ${
          isEN ? 'bg-amber-400 text-black font-semibold' : 'text-neutral-300'
        }`}
        aria-pressed={isEN}
      >
        {t('settings.en')}
      </button>
      <button
        onClick={() => setLocale('es')}
        className={`px-3 py-1 rounded-full text-sm ${
          !isEN ? 'bg-amber-400 text-black font-semibold' : 'text-neutral-300'
        }`}
        aria-pressed={!isEN}
      >
        {t('settings.es')}
      </button>
    </div>
  );
}

/* ---------- page ---------- */
export default function SettingsPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [offline, setOffline] = useLocalStorage<boolean>('pref.offline', true);
  const [dark, setDark] = useLocalStorage<boolean>('pref.dark', true);

  useEffect(() => {
    const el = document.documentElement;
    if (dark) el.classList.add('dark');
    else el.classList.remove('dark');
  }, [dark]);

  const signOut = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <CardShell
      heroSrc={null}
      headerLeft={<BrandMark />}
      contentClassName=""
      footer={<NavTab active="settings" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">{t('settings.title')}</h1>

      {/* Account */}
      <h2 className="mt-5 mb-2 text-neutral-400 text-sm font-semibold tracking-wide">
        {t('settings.sections.account')}
      </h2>
      <div className="space-y-3">
        <Link href="/settings/profile" className="no-underline">
          <Row
            leading={<Icon name="profile" />}
            title={t('settings.profile')}
            subtitle={t('settings.profileHint')}
          />
        </Link>

        <Link href="/settings/subscriptions" className="no-underline">
          <Row
            leading={<Icon name="sync" />}
            title={t('settings.subscriptions')}
            subtitle={t('settings.subscriptionsHint')}
          />
        </Link>
      </div>

      {/* Preferences */}
      <h2 className="mt-6 mb-2 text-neutral-400 text-sm font-semibold tracking-wide">
        {t('settings.sections.preferences')}
      </h2>
      <div className="space-y-3">
        <Link href="/settings/units" className="no-underline">
          <Row
            leading={<Icon name="rule" />}
            title={t('settings.units')}
            subtitle={t('settings.unitsHint')}
          />
        </Link>

        <Row
          leading={<Icon name="sync" />}
          title={t('settings.offline')}
          subtitle={t('settings.offlineHint')}
          trailing={<Switch checked={offline} onChange={setOffline} />}
        />

        {/* Privacy (Terms & Privacy) */}
        <Link href="/settings/terms" className="no-underline">
          <Row
            leading={<Icon name="privacy" />}
            title={t('settings.privacy')}
            subtitle={t('settings.privacyHint')}
          />
        </Link>

        {/* Language */}
        <Row
          leading={<Icon name="lang" />}
          title={t('settings.language')}
          subtitle={t('settings.languageHint')}
          trailing={<SegmentedLang />}
        />
      </div>

      {/* Support & Legal */}
      <h2 className="mt-6 mb-2 text-neutral-400 text-sm font-semibold tracking-wide">
        {t('settings.sections.support')}
      </h2>
      <div className="space-y-3">
        <Link href="/settings/help" className="no-underline">
          <Row
            leading={<Icon name="help" />}
            title={t('help.title')}
            subtitle={t('help.subtitle')}
          />
        </Link>
        <Link href="/settings/notifications" className="no-underline">
          <Row
            leading={<Icon name="bell" />}
            title={t('notifications.menu')}
            subtitle={t('notifications.menuHint')}
          />
        </Link>
      </div>

      {/* Theme */}
      <h2 className="mt-6 mb-2 text-neutral-400 text-sm font-semibold tracking-wide">
        {t('settings.sections.theme')}
      </h2>
      <div className="space-y-3">
        <Row
          leading={<Icon name="moon" />}
          title={t('settings.dark')}
          subtitle={t('settings.darkHint')}
          trailing={<Switch checked={dark} onChange={setDark} />}
        />
      </div>

      {/* Sign out */}
      <div className="mt-6">
        <Button className="h-11 w-full rounded-xl" onClick={signOut}>
          {t('settings.signOut')}
        </Button>
      </div>
    </CardShell>
  );
}
