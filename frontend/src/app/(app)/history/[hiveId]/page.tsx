import HistoryClient from '@/app/(app)/analysis/history/HistoryClient';
import { listHistoryMock } from '@/data/history.mock';

export default async function HiveHistoryPage({ params }: { params: Promise<{ hiveId: string }> }) {
  const { hiveId } = await params;
  const { kpis, entries, hiveName } = await listHistoryMock('demo-user', hiveId);
  return <HistoryClient kpis={kpis} entries={entries} hiveName={hiveName ?? undefined} />;
}
