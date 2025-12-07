//frontend/src/app/(app)/settings/terms/page.tsx
'use client';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

function Section({ h, p }: { h: string; p: string }) {
  return (
    <section className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
      <h3 className="font-semibold">{h}</h3>
      <p className="mt-1 text-sm leading-relaxed text-neutral-300">{p}</p>
    </section>
  );
}

export default function PrivacyPage() {
  const { t } = useI18n();

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
      <h1 className="text-[26px] font-extrabold tracking-tight">{t('terms.title')}</h1>
      <p className="mt-1 text-sm text-neutral-400">{t('terms.updated')}</p>

      <div className="mt-4 space-y-3">
        <Section h={t('terms.s1.h')} p={t('terms.s1.p')} />
        <Section h={t('terms.s2.h')} p={t('terms.s2.p')} />
        <Section h={t('terms.s3.h')} p={t('terms.s3.p')} />
        <Section h={t('terms.s4.h')} p={t('terms.s4.p')} />
        <Section h={t('terms.s5.h')} p={t('terms.s5.p')} />
      </div>
    </CardShell>
  );
}
