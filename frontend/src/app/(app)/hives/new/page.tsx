'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import BackBtn from '@/components/BackBtn';
import NavTab from '@/components/NavTab';
import Input from '@/components/ui/Input';
import Select from '@/components/forms/Select';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

type HiveKind = 'langstroth' | 'top_bar' | 'warre' | 'flow' | 'other';
interface Hive {
  id: string;
  apiaryId: string;
  kind: HiveKind;
  label: string;
  notes?: string | null;
  lat: number;
  lng: number;
}

const tv = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

export default function NewHivePage() {
  const { t } = useI18n();
  const router = useRouter();

  const [apiaryId, setApiaryId] = useState<string | null>(null);
  const [kind, setKind] = useState<HiveKind>('langstroth');
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Necesitamos un apiario activo; si no existe, manda a crear uno
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hr.apiary');
      if (!raw) return router.replace('/apiaries/new');
      const a = JSON.parse(raw) as { id?: string; lat?: number | null; lng?: number | null };
      if (!a?.id) return router.replace('/apiaries/new');
      setApiaryId(a.id);
      // Prefill coords si el apiario tiene lat/lng guardados
      if (typeof a.lat === 'number') setLat(String(a.lat));
      if (typeof a.lng === 'number') setLng(String(a.lng));
    } catch {
      router.replace('/apiaries/new');
    }
  }, [router]);

  const getMyLocation = () => {
    if (!('geolocation' in navigator)) {
      return setErr(tv(t, 'map.noGeo', 'Geolocation not available'));
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(String(p.coords.latitude.toFixed(6)));
        setLng(String(p.coords.longitude.toFixed(6)));
      },
      () => setErr(tv(t, 'map.geoDenied', 'Permission denied')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  function readHives(): Hive[] {
    try {
      const raw = localStorage.getItem('hr.hives');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((h): Hive | null => {
          const o = h as Record<string, unknown>;
          if (
            typeof o.id === 'string' &&
            typeof o.apiaryId === 'string' &&
            typeof o.kind === 'string' &&
            typeof o.label === 'string' &&
            typeof o.lat === 'number' &&
            typeof o.lng === 'number'
          ) {
            return {
              id: o.id,
              apiaryId: o.apiaryId,
              kind: o.kind as HiveKind,
              label: o.label,
              notes: (o.notes as string | null | undefined) ?? null,
              lat: o.lat,
              lng: o.lng,
            };
          }
          return null;
        })
        .filter((x): x is Hive => x !== null);
    } catch {
      return [];
    }
  }

  function saveHives(hives: Hive[]) {
    localStorage.setItem('hr.hives', JSON.stringify(hives));
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!apiaryId) return setErr(tv(t, 'hive.errors.noApiary', 'No active apiary.'));
    if (!label.trim()) return setErr(tv(t, 'hive.errors.labelReq', 'Please add a label/name.'));
    if (!lat || !lng)
      return setErr(tv(t, 'hive.errors.coordsReq', 'Lat/Lng required (use “My location”).'));

    setLoading(true);
    try {
      const arr = readHives();
      const hive: Hive = {
        id: `hive-${Date.now()}`,
        apiaryId,
        kind,
        label: label.trim(),
        notes: notes || null,
        lat: Number(lat),
        lng: Number(lng),
      };
      arr.push(hive);
      saveHives(arr);

      // resaltar en mapa al abrir
      localStorage.setItem(
        'map.highlight',
        JSON.stringify({ hiveId: hive.id, name: hive.label, lat: hive.lat, lng: hive.lng })
      );

      // Regresar al home de apiarios (como pediste)
      router.replace('/apiaries');
    } catch {
      setErr(tv(t, 'hive.errors.saveFail', 'Could not save your hive.'));
    } finally {
      setLoading(false);
    }
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
      footer={<NavTab active="home" />}
    >
      <h1 className="text-[22px] font-bold">{tv(t, 'hive.newTitle', 'New Hive')}</h1>
      <p className="mt-1 text-sm text-neutral-400">
        {tv(t, 'hive.newSubtitle', 'It will be saved to your active apiary.')}
      </p>

      <form onSubmit={save} className="mt-4 grid max-w-sm grid-cols-1 gap-3">
        <div>
          <label className="mb-2 block text-sm text-neutral-400">
            {tv(t, 'hive.fields.kind', 'Type')}
          </label>
          <Select<HiveKind>
            value={kind}
            onChange={setKind}
            options={[
              { label: tv(t, 'apiary.types.langstroth', 'Langstroth'), value: 'langstroth' },
              { label: 'Top-bar', value: 'top_bar' },
              { label: 'Warré', value: 'warre' },
              { label: 'Flow', value: 'flow' },
              { label: tv(t, 'common.other', 'Other'), value: 'other' },
            ]}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-400">
            {tv(t, 'hive.fields.label', 'Label / Name')}
          </label>
          <Input
            placeholder={tv(t, 'hive.placeholders.label', 'e.g. Hive A-01')}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-2 block text-sm text-neutral-400">
              {tv(t, 'hive.fields.lat', 'Lat')}
            </label>
            <Input
              inputMode="decimal"
              placeholder="-15.79"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-400">
              {tv(t, 'hive.fields.lng', 'Lng')}
            </label>
            <Input
              inputMode="decimal"
              placeholder="-47.88"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={getMyLocation}
            className="text-xs text-amber-400 underline underline-offset-2"
          >
            {tv(t, 'hive.actions.useMyLocation', 'Use my location')}
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-400">
            {tv(t, 'hive.fields.notes', 'Notes (optional)')}
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-xl bg-neutral-900 p-3 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder={tv(t, 'hive.placeholders.notes', 'Observations, queen, treatment, etc.')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {err && <p className="text-sm text-rose-400">{err}</p>}

        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
          {loading ? '...' : tv(t, 'hive.saveCta', 'Save hive')}
        </Button>
      </form>
    </CardShell>
  );
}
