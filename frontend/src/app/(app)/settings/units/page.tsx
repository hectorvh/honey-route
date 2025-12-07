'use client';

import { useEffect, useState } from 'react';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';
import { DEFAULT_UNITS, loadUnits, type Units } from './units';

// helper i18n con fallback
const tv = (t: (k: string) => string, key: string, fallback: string) =>
  t(key) === key ? fallback : t(key);

export default function UnitsPage() {
  const { t } = useI18n();
  const [units, setUnits] = useState<Units>(() => loadUnits());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUnits(loadUnits());
  }, []);

  const update = <K extends keyof Units>(key: K, value: Units[K]) => {
    setUnits((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('hr.units', JSON.stringify(units));
      setSaved(true);
    } catch {
      // ignore
    }
  };

  const onReset = () => {
    setUnits(DEFAULT_UNITS);
    setSaved(false);
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
      contentClassName="pb-24 pt-2"
      footer={<NavTab active="settings" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">
        {tv(t, 'settings.unitsPage.title', 'Units & formats')}
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        {tv(
          t,
          'settings.unitsPage.subtitle',
          'Choose how you prefer to see temperatures, distances and weights.'
        )}
      </p>

      <form onSubmit={onSave} className="mt-4 space-y-4 max-w-sm">
        {/* Temperature */}
        <section className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <h2 className="text-sm font-semibold">
            {tv(t, 'settings.unitsPage.temperature', 'Temperature')}
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            {tv(
              t,
              'settings.unitsPage.temperatureHint',
              'Used for brood, hive and weather temperature.'
            )}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => update('temperature', 'c')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                units.temperature === 'c'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-black/40 text-neutral-200'
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => update('temperature', 'f')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                units.temperature === 'f'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-black/40 text-neutral-200'
              }`}
            >
              °F
            </button>
          </div>
        </section>

        {/* Distance */}
        <section className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <h2 className="text-sm font-semibold">
            {tv(t, 'settings.unitsPage.distance', 'Distance')}
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            {tv(
              t,
              'settings.unitsPage.distanceHint',
              'For maps, forage radius and travel distance.'
            )}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => update('distance', 'km')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                units.distance === 'km'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-black/40 text-neutral-200'
              }`}
            >
              km
            </button>
            <button
              type="button"
              onClick={() => update('distance', 'mi')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                units.distance === 'mi'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-black/40 text-neutral-200'
              }`}
            >
              miles
            </button>
          </div>
        </section>

        {/* Weight */}
        <section className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <h2 className="text-sm font-semibold">{tv(t, 'settings.unitsPage.weight', 'Weight')}</h2>
          <p className="mt-1 text-xs text-neutral-400">
            {tv(
              t,
              'settings.unitsPage.weightHint',
              'For hive weight, harvest and feed measurements.'
            )}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => update('weight', 'kg')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                units.weight === 'kg'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-black/40 text-neutral-200'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => update('weight', 'lb')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                units.weight === 'lb'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-black/40 text-neutral-200'
              }`}
            >
              lb
            </button>
          </div>
        </section>

        {saved && (
          <p className="text-sm text-emerald-400">
            {tv(t, 'settings.unitsPage.saved', 'Preferences saved.')}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" className="h-11 flex-1 rounded-xl">
            {tv(t, 'settings.unitsPage.saveCta', 'Save units')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 flex-1 rounded-xl"
            onClick={onReset}
          >
            {tv(t, 'settings.unitsPage.resetCta', 'Reset')}
          </Button>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          {tv(
            t,
            'settings.unitsPage.localNote',
            'These preferences are stored in your browser and can be changed at any time.'
          )}
        </p>
      </form>
    </CardShell>
  );
}
