import { supabaseBrowser } from '@/lib/supabase/client';

export type HiveKind = 'langstroth' | 'top_bar' | 'warre' | 'flow' | 'other';
export interface HiveInput {
  apiary_id: string;
  kind: HiveKind;
  label?: string;
  notes?: string;
}

export async function createHive(input: HiveInput) {
  const supabase = supabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión inválida.');

  const { error } = await supabase.from('hives').insert([
    {
      owner_id: user.id,
      apiary_id: input.apiary_id,
      kind: input.kind,
      label: input.label ?? null,
      notes: input.notes ?? null,
    },
  ]);
  if (error) throw error;
}
