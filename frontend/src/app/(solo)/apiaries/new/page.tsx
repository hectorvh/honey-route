'use client';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NewApiaryForm from '@/components/forms/NewApiaryForm';
import { useI18n } from '@/i18n/I18nProvider';

export default function NewApiaryPage() {
  const { t } = useI18n();

  return (
    <CardShell heroSrc={null} headerLeft={<BrandMark />} headerRight={<LangToggle />}>
      {/* Igualamos el ancho interno al del login */}
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-3xl font-extrabold leading-tight text-center">
          {t('apiary.newTitle')}
        </h1>
        {/* Si no tienes newSubtitle en i18n, borra este <p> */}
        <p className="mt-2 text-center text-neutral-300">{t('apiary.newSubtitle')}</p>

        <div className="mt-6">
          <NewApiaryForm />
        </div>

        <p className="mt-8 text-center text-xs text-neutral-500">
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
