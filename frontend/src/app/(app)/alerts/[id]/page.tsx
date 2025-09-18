import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import AlertDetailClient from './client';

export default async function AlertDetailPage({ params }: { params: { id: string } }) {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  return <AlertDetailClient id={params.id} />;
}
