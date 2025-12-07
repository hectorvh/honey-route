//frontend/src/app/(app)/settings/help/page.tsx
'use client';

import { useState } from 'react';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

type Faq = { q: string; a: string };

function Item({ q, a }: Faq) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-neutral-900 ring-1 ring-black/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
        aria-expanded={open}
      >
        <span className="text-left font-semibold">{q}</span>
        <span className="text-neutral-500">{open ? '–' : '+'}</span>
      </button>
      {open && <p className="px-4 pb-4 pt-0 text-sm text-neutral-300">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  const { t } = useI18n();
  const faqs: Faq[] = [
    { q: t('help.faq.q1'), a: t('help.faq.a1') },
    { q: t('help.faq.q2'), a: t('help.faq.a2') },
    { q: t('help.faq.q3'), a: t('help.faq.a3') },
    { q: t('help.faq.q4'), a: t('help.faq.a4') },
  ];

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
      <h1 className="text-[26px] font-extrabold tracking-tight">{t('help.title')}</h1>
      <p className="mt-1 text-sm text-neutral-400">{t('help.subtitle')}</p>

      <div className="mt-4 space-y-3">
        {faqs.map((f, i) => (
          <Item key={i} {...f} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-neutral-900 p-4 text-center ring-1 ring-black/5">
        <p className="text-sm text-neutral-300">{t('help.more')}</p>
        <a
          href="mailto:support@ecoventus.example"
          className="mt-3 inline-block rounded-xl bg-amber-400 px-4 py-2 font-semibold text-black hover:bg-amber-300"
        >
          {t('help.contact')}
        </a>
      </div>
    </CardShell>
  );
}
