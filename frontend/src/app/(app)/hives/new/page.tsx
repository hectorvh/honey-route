// frontend/src/app/(app)/hives/new/page.tsx
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

export default function NewHivePage() {
  const router = useRouter();

  const [apiaryId, setApiaryId] = useState<string | null>(null);
  const [kind, setKind] = useState<HiveKind>('langstroth');
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hr.apiary');
      if (!raw) return router.replace('/apiaries/new'); // primero crea apiario
      const a = JSON.parse(raw) as { id?: string };
      if (!a?.id) return router.replace('/apiaries/new');
      setApiaryId(a.id);
    } catch {
      router.replace('/apiaries/new');
    }
  }, [router]);

  const getMyLocation = () => {
    if (!('geolocation' in navigator)) return setErr('Geolocation no disponible.');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(String(p.coords.latitude.toFixed(6)));
        setLng(String(p.coords.longitude.toFixed(6)));
      },
      () => setErr('Permiso de ubicación denegado.'),
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
    if (!apiaryId) return setErr('No hay apiario activo.');
    if (!label.trim()) return setErr('Pon un nombre/etiqueta para la colmena.');
    if (!lat || !lng) return setErr('Lat/Lng requeridos (puedes usar “mi ubicación”).');

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

      localStorage.setItem(
        'map.highlight',
        JSON.stringify({ hiveId: hive.id, name: hive.label, lat: hive.lat, lng: hive.lng })
      );

      router.replace('/apiaries'); // ✅ vuelve al home de apiarios
    } catch {
      setErr('No pudimos guardar tu colmena.');
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
      <h1 className="text-[22px] font-bold">Nueva colmena</h1>
      <p className="mt-1 text-sm text-neutral-400">Se guardará en tu apiario activo.</p>

      <form onSubmit={save} className="mt-4 grid max-w-sm grid-cols-1 gap-3">
        <div>
          <label className="mb-2 block text-sm text-neutral-400">Tipo</label>
          <Select<HiveKind>
            value={kind}
            onChange={setKind}
            options={[
              { label: 'Langstroth', value: 'langstroth' },
              { label: 'Top-bar', value: 'top_bar' },
              { label: 'Warré', value: 'warre' },
              { label: 'Flow', value: 'flow' },
              { label: 'Otro', value: 'other' },
            ]}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-400">Etiqueta / nombre</label>
          <Input
            placeholder="Ej. Hive A-01"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-2 block text-sm text-neutral-400">Lat</label>
            <Input
              inputMode="decimal"
              placeholder="-15.79"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-400">Lng</label>
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
            Usar mi ubicación
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-400">Notas (opcional)</label>
          <textarea
            className="min-h-[80px] w-full rounded-xl bg-neutral-900 p-3 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Observaciones, reina, tratamiento, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {err && <p className="text-sm text-rose-400">{err}</p>}

        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
          {loading ? '...' : 'Guardar colmena'}
        </Button>
      </form>
    </CardShell>
  );
}
