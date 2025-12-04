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
      setErr(t('apiary.errors.noGeo') || t('map.noGeo') || 'Geolocation not available.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(String(p.coords.latitude.toFixed(6)));
        setLng(String(p.coords.longitude.toFixed(6)));
      },
      () => setErr(t('apiary.errors.geoDenied') || t('map.geoDenied') || 'Permission denied.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr(t('apiary.errors.nameReq') || 'Name required.');

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

      onDone?.();
    } catch {
      setErr(t('common.genericError') || 'Could not save apiary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4">
      {/* Nombre */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">
          {t('apiary.nameLabel') || t('apiary.name') || 'Apiary Name'}
        </label>
        <Input
          placeholder={t('apiary.namePh') || 'e.g. Golden Fields Apiary'}
          value={name}
          onChange={(ev) => setName(ev.target.value)}
        />
      </div>

      {/* Ubicación libre */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">
          {t('apiary.locationLabel') || t('apiary.locationOpt') || 'Location (optional)'}
        </label>
        <Input
          placeholder={t('apiary.locationPh') || 'City, state/country'}
          value={location}
          onChange={(ev) => setLocation(ev.target.value)}
        />
      </div>

      {/* Coordenadas */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-2 block text-sm text-neutral-400">{t('apiary.lat') || 'Lat'}</label>
          <Input
            inputMode="decimal"
            placeholder="-15.793889"
            value={lat}
            onChange={(ev) => setLat(ev.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-neutral-400">{t('apiary.lng') || 'Lng'}</label>
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
          {t('apiary.useMyLocation') || 'Use my location'}
        </button>
      </div>

      {/* Elevación y manejo */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-2 block text-sm text-neutral-400">
            {t('apiary.elevationLabel') || 'Elevation (m)'}
          </label>
          <Input
            inputMode="numeric"
            placeholder={t('apiary.elevationPh') || 'e.g. 1200'}
            value={elevation}
            onChange={(ev) => setElevation(ev.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-neutral-400">
            {t('apiary.mgmtLabel') || 'Management'}
          </label>
          <Select<Mgmt>
            value={mgmt}
            onChange={setMgmt}
            options={[
              { label: t('apiary.mgmt.integrated') || 'Integrated', value: 'integrated' },
              { label: t('apiary.mgmt.conventional') || 'Conventional', value: 'conventional' },
              { label: t('apiary.mgmt.organic') || 'Organic', value: 'organic' },
            ]}
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">
          {t('apiary.notesLabel') || 'Notes (optional)'}
        </label>
        <textarea
          className="min-h-[90px] w-full rounded-xl bg-neutral-900 p-3 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder={t('apiary.notesPh') || 'Local flora, access, irrigation, etc.'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {err && <p className="text-sm text-rose-400">{err}</p>}

      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? '...' : `+ ${t('apiary.createCta') || 'Create Apiary'}`}
      </Button>
    </form>
  );
}
