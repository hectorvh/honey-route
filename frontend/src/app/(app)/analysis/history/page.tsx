import HistoryClient from './HistoryClient';
import { listHistoryMock } from '@/data/history.mock';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ hiveId?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const hiveId = sp.hiveId ?? null;

  const { kpis, entries, hiveName } = await listHistoryMock('demo-user', hiveId);
  return <HistoryClient kpis={kpis} entries={entries} hiveName={hiveName ?? undefined} />;
}
