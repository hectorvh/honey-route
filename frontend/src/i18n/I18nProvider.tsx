'use client';
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import en from './messages/en.json';
import es from './messages/es.json';

type Locale = 'en' | 'es';
type Messages = typeof en;
const dicts: Record<Locale, Messages> = { en, es };

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (path: string) => string };
const I18nCtx = createContext<Ctx | null>(null);

function getFromPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // 1er render = 'en' (coincide con SSR). Luego hidratamos desde localStorage.
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale') as Locale | null;
      if (saved === 'en' || saved === 'es') setLocale(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('locale', locale);
    } catch {}
  }, [locale]);

  const t = useCallback(
    (path: string) => {
      const value = getFromPath(dicts[locale], path);
      return typeof value === 'string' ? value : path;
    },
    [locale]
  );

  const value = useMemo<Ctx>(() => ({ locale, setLocale, t }), [locale, t]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
