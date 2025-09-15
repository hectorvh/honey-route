'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/forms/Select';
import { useI18n } from '@/i18n/I18nProvider';
import { supabaseBrowser } from '@/lib/supabase/client';

type HiveType = 'Langstroth' | 'Top-bar' | 'Warre';

type SupabaseErr = {
  message: string;
  status?: number;
  code?: string;
};

function isSupabaseErr(e: unknown): e is SupabaseErr {
  return typeof e === 'object' && e !== null && 'message' in e;
}

function normalizeError(e: unknown, t: (k: string) => string): string {
  if (isSupabaseErr(e)) {
    // Mapear estados/errores típicos a traducciones
    if (e.status === 401) return t('auth.notAuthenticated');
    if (e.status === 403) return t('auth.forbidden');
    // Evita mostrar mensajes crudos en inglés si no los mapeamos
    return t('common.genericError');
  }
  return t('common.genericError');
}

export default function NewApiaryForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [hiveType, setHiveType] = useState<HiveType>('Langstroth');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr(t('apiary.errors.nameReq'));

    setLoading(true);
    try {
      const supabase = supabaseBrowser();

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData.user;
      if (!user) throw { message: 'not authed', status: 401 } satisfies SupabaseErr;

      // Insert apiary (nota: columna owner_id)
      const { data: apiary, error: aErr } = await supabase
        .from('apiaries')
        .insert({
          owner_id: user.id,
          name,
          location: location || null,
        })
        .select('id')
        .single();

      if (aErr) throw aErr;

      // Opcional: crear una colmena inicial
      const { error: hErr } = await supabase.from('hives').insert({
        owner_id: user.id,
        apiary_id: apiary.id,
        kind: hiveType,
        label: 'Hive 1',
        notes: null,
      });
      if (hErr) {
        // Log suave; no bloquea el flujo ni rompe el idioma.
        // eslint-disable-next-line no-console
        console.warn('Hive insert failed (non-blocking):', hErr);
      }

      router.replace('/hives');
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Create apiary failed:', e);
      setErr(normalizeError(e, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xs space-y-4">
      <div>
        <label className="mb-2 block text-sm text-neutral-400">{t('apiary.name')}</label>
        <Input
          placeholder={t('apiary.namePh')}
          value={name}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setName(ev.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-neutral-400">{t('apiary.locationOpt')}</label>
        <Input
          placeholder={t('apiary.locationPh')}
          value={location}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setLocation(ev.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-neutral-400">{t('apiary.hiveType')}</label>
        <Select<HiveType>
          value={hiveType}
          onChange={(v) => setHiveType(v)}
          options={[
            { label: 'Langstroth', value: 'Langstroth' },
            { label: 'Top-bar', value: 'Top-bar' },
            { label: 'Warre', value: 'Warre' },
          ]}
        />
      </div>

      {err && <p className="text-sm text-red-400">{err}</p>}

      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? '...' : `+ ${t('apiary.createCta')}`}
      </Button>
    </form>
  );
}
