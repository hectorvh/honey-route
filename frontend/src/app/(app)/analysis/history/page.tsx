import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { listHistory } from '@/data/actions.server';
import HistoryClient from './HistoryClient';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: { hiveId?: string };
}) {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Opcional: filtra por apiario si viene de /analysis/result?hiveId=...
  const hiveId = searchParams?.hiveId ?? null;

  const { kpis, entries, hiveName } = await listHistory(session.user.id, hiveId);

  return <HistoryClient kpis={kpis} entries={entries} hiveName={hiveName ?? undefined} />;
}
