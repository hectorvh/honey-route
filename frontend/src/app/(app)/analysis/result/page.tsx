import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ResultClient from './result.client';

export default async function ResultPage() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  return <ResultClient />;
}
