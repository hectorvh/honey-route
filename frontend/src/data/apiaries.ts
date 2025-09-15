import { supabaseBrowser } from '@/lib/supabase/client';

export interface ApiaryInput {
  name: string;
  location?: string;
}
export interface ApiaryRow extends ApiaryInput {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export async function createApiary(input: ApiaryInput): Promise<ApiaryRow> {
  const supabase = supabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión inválida.');

  const { data, error } = await supabase
    .from('apiaries')
    .insert([{ owner_id: user.id, name: input.name, location: input.location ?? null }])
    .select()
    .single();

  if (error) throw error;
  return data as ApiaryRow;
}
