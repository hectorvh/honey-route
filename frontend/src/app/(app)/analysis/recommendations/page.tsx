import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import RecsClient from './recs.client';

export default async function RecsPage() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  return <RecsClient />;
}
