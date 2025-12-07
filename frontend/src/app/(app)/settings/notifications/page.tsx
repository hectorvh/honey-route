//frontend/src/app/(app)/settings/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

function usePref(key: string, initial = true) {
  const [val, setVal] = useState<boolean>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setVal(JSON.parse(raw));
    } catch {}
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal] as const;
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

function Row({
  title,
  subtitle,
  checked,
  onChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-neutral-900 px-4 py-3 ring-1 ring-black/5">
      <div className="min-w-0 pr-3">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-neutral-400">{subtitle}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

export default function NotificationsPage() {
  const { t } = useI18n();

  const [critical, setCritical] = usePref('notif.inapp.critical', true);
  const [routine, setRoutine] = usePref('notif.inapp.routine', true);
  const [updates, setUpdates] = usePref('notif.inapp.updates', false);
  const [urgent, setUrgent] = usePref('notif.push.urgent', false);
  const [general, setGeneral] = usePref('notif.push.general', false);

  const supported = typeof window !== 'undefined' && 'Notification' in window;

  const requestPush = async () => {
    if (!supported) return alert(t('notifications.notSupported'));
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') alert(t('notifications.denied'));
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
      footer={<NavTab active="settings" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">{t('notifications.title')}</h1>
      <p className="mt-1 text-sm text-neutral-400">{t('notifications.subtitle')}</p>

      <h2 className="mt-5 mb-2 text-sm font-semibold tracking-wide text-neutral-400">
        {t('notifications.inapp')}
      </h2>
      <div className="space-y-3">
        <Row
          title={t('notifications.critical.t')}
          subtitle={t('notifications.critical.d')}
          checked={critical}
          onChange={setCritical}
        />
        <Row
          title={t('notifications.routine.t')}
          subtitle={t('notifications.routine.d')}
          checked={routine}
          onChange={setRoutine}
        />
        <Row
          title={t('notifications.updates.t')}
          subtitle={t('notifications.updates.d')}
          checked={updates}
          onChange={setUpdates}
        />
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-neutral-400">
        {t('notifications.push')}
      </h2>
      <div className="space-y-3">
        <Row
          title={t('notifications.urgent.t')}
          subtitle={t('notifications.urgent.d')}
          checked={urgent}
          onChange={setUrgent}
        />
        <Row
          title={t('notifications.general.t')}
          subtitle={t('notifications.general.d')}
          checked={general}
          onChange={setGeneral}
        />
      </div>

      {!supported && (
        <p className="mt-4 text-sm text-amber-300">{t('notifications.notSupported')}</p>
      )}

      <button
        type="button"
        onClick={requestPush}
        className="mt-5 h-11 w-full rounded-xl bg-amber-400 font-semibold text-black shadow hover:bg-amber-300"
      >
        {t('notifications.enable')}
      </button>
    </CardShell>
  );
}
