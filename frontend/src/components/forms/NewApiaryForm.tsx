'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';
import Select from '@/components/forms/Select';

type Mgmt = 'conventional' | 'organic' | 'integrated';

export default function NewApiaryForm({ onDone }: { onDone?: () => void }) {
  const { t } = useI18n();

  // Básicos
  const [name, setName] = useState('');
  const [location, setLocation] = useState(''); // ciudad/estado/país libre
  // Coordenadas (opcionales)
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  // Otros datos útiles
  const [elevation, setElevation] = useState<string>(''); // msnm
  const [mgmt, setMgmt] = useState<Mgmt>('integrated');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const getMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setErr('Geolocation no disponible en este dispositivo.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(String(p.coords.latitude.toFixed(6)));
        setLng(String(p.coords.longitude.toFixed(6)));
      },
      () => setErr('Permiso de ubicación denegado.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr(t('apiary.errors.nameReq') || 'Nombre requerido.');

    setLoading(true);
    try {
      // Crea apiario activo en localStorage
      const apiary = {
        id: `apiary-${Date.now()}`,
        name: name.trim(),
        location: location || null,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        elevation: elevation ? Number(elevation) : null,
        mgmt,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Guarda "apiario activo"
      localStorage.setItem('hr.apiary', JSON.stringify(apiary));

      // Si no existen colmenas, crea arreglo vacío
      const rawH = localStorage.getItem('hr.hives');
      if (!rawH) localStorage.setItem('hr.hives', JSON.stringify([]));

      // Marca sesión local por si hiciera falta
      localStorage.setItem('hr.authed', '1');

      onDone?.();
    } catch {
      setErr(t('common.genericError') || 'No pudimos guardar el apiario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4">
      {/* Nombre */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">
          {t('apiary.name') || 'Nombre del apiario'}
        </label>
        <Input
          placeholder={t('apiary.namePh') || 'Ej. Golden Fields Apiary'}
          value={name}
          onChange={(ev) => setName(ev.target.value)}
        />
      </div>

      {/* Ubicación libre */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">
          {t('apiary.locationOpt') || 'Ubicación (opcional)'}
        </label>
        <Input
          placeholder={t('apiary.locationPh') || 'Ciudad, estado/país'}
          value={location}
          onChange={(ev) => setLocation(ev.target.value)}
        />
      </div>

      {/* Coordenadas */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-2 block text-sm text-neutral-400">Lat</label>
          <Input
            inputMode="decimal"
            placeholder="-15.793889"
            value={lat}
            onChange={(ev) => setLat(ev.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-neutral-400">Lng</label>
          <Input
            inputMode="decimal"
            placeholder="-47.882778"
            value={lng}
            onChange={(ev) => setLng(ev.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={getMyLocation}
          className="text-xs underline underline-offset-2 text-amber-400"
        >
          Usar mi ubicación
        </button>
      </div>

      {/* Elevación y manejo */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-2 block text-sm text-neutral-400">Elevación (m)</label>
          <Input
            inputMode="numeric"
            placeholder="Ej. 1200"
            value={elevation}
            onChange={(ev) => setElevation(ev.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-neutral-400">Manejo</label>
          <Select<Mgmt>
            value={mgmt}
            onChange={setMgmt}
            options={[
              { label: 'Integrado', value: 'integrated' },
              { label: 'Convencional', value: 'conventional' },
              { label: 'Orgánico', value: 'organic' },
            ]}
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">Notas (opcional)</label>
        <textarea
          className="min-h-[90px] w-full rounded-xl bg-neutral-900 p-3 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Flora de la zona, accesos, riego, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {err && <p className="text-sm text-rose-400">{err}</p>}

      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? '...' : `+ ${t('apiary.createCta') || 'Crear apiario'}`}
      </Button>
    </form>
  );
}
