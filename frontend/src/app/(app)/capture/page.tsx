// frontend/src/app/(app)/capture/page.tsx
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import CaptureClient from './CaptureClient';

export default async function CapturePage() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return <CaptureClient />;
}
