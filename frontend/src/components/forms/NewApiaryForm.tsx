'use client';

import { useState } from 'react';
import type React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';
import Select from '@/components/forms/Select';

type Mgmt = 'conventional' | 'organic' | 'integrated';

type ApiaryCreated = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export default function NewApiaryForm({ onDone }: { onDone?: (apiary: ApiaryCreated) => void }) {
  const { t } = useI18n();

  // Básicos
  const [name, setName] = useState('');
  const [location, setLocation] = useState(''); // ciudad / país / lo que sea
  // Otros datos útiles
  const [elevation, setElevation] = useState<string>(''); // msnm (opcional)
  const [mgmt, setMgmt] = useState<Mgmt>('integrated');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(''); // data URL de la foto subida

  // Manejar upload de imagen desde el dispositivo
  const onImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result); // data:image/png;base64,....
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr(t('apiary.errors.nameReq') || 'Name required.');

    setLoading(true);
    try {
      const nowIso = new Date().toISOString();

      // Crea apiario activo en localStorage (sin lat/lng, solo ubicación general)
      const apiary = {
        id: `apiary-${Date.now()}`,
        name: name.trim(),
        location: location || null,
        elevation: elevation ? Number(elevation) : null,
        mgmt,
        notes: notes || null,
        imageUrl: imageUrl || null,
        created_at: nowIso,
        updated_at: nowIso,
      };

      // Guarda "apiario activo"
      localStorage.setItem('hr.apiary', JSON.stringify(apiary));

      // Si no existen colmenas, crea arreglo vacío
      const rawH = localStorage.getItem('hr.hives');
      if (!rawH) localStorage.setItem('hr.hives', JSON.stringify([]));

      // Guarda en lista de apiarios locales para mezclarlos con los mocks
      try {
        const rawList = localStorage.getItem('hr.apiaries');
        let list: (typeof apiary)[] = [];
        if (rawList) {
          const parsed = JSON.parse(rawList);
          if (Array.isArray(parsed)) list = parsed;
        }
        list.push(apiary);
        localStorage.setItem('hr.apiaries', JSON.stringify(list));
      } catch {
        // si algo falla aquí, al menos hr.apiary ya está
      }

      // Avisar al padre cuál apiario se creó
      onDone?.({
        id: apiary.id,
        name: apiary.name,
        imageUrl: apiary.imageUrl,
      });
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

      {/* Ubicación libre (ciudad, país…) */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">
          {t('apiary.locationLabel') || t('apiary.locationOpt') || 'Location (optional)'}
        </label>
        <Input
          placeholder={t('apiary.locationPh') || 'City, country'}
          value={location}
          onChange={(ev) => setLocation(ev.target.value)}
        />
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

      {/* Foto (subir desde dispositivo) */}
      <div>
        <label className="mb-2 block text-sm text-neutral-400">
          {t('apiary.photoLabel') || 'Photo (optional)'}
        </label>

        {/* input real, oculto */}
        <input
          id="apiary-photo-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageFileChange}
        />

        <button
          type="button"
          onClick={() => document.getElementById('apiary-photo-input')?.click()}
          className="h-10 rounded-2xl bg-neutral-900 px-4 text-sm font-semibold text-white ring-1 ring-black/5 hover:bg-neutral-800"
        >
          {imageUrl
            ? t('apiary.photoChangeCta') || 'Change photo'
            : t('apiary.photoUploadCta') || 'Upload photo'}
        </button>

        {imageUrl && (
          <div className="mt-2 flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg ring-1 ring-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Apiary preview" className="h-full w-full object-cover" />
            </div>
            <p className="text-xs text-neutral-500">
              {t('apiary.photoSelected') || 'Photo selected and stored locally.'}
            </p>
          </div>
        )}
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
