import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootGate() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/onboarding');

  const { count, error } = await supabase
    .from('apiaries')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', session.user.id); // <-- usa la columna correcta

  if (error) redirect('/apiaries/new');
  if (!count || count === 0) redirect('/apiaries/new');

  redirect('/hives');
}
