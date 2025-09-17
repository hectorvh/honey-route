import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import UploadClient from './UploadClient';

export default async function UploadPage() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  return <UploadClient />;
}
