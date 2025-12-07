// frontend/src/app/(app)/apiaries/quick-analysis/analysis/history/page.tsx
import HistoryClient, { type Kpis, type ActionEntry } from './HistoryClient';
import { listHistoryMock, type HistoryKpis, type HistoryEntry } from './mock';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ hiveId?: string }>;
}) {
  // ✅ cumplir con la nueva API de Next: await searchParams
  const sp = await searchParams;
  const hiveId = sp?.hiveId ?? null;

  // datos base del mock
  const {
    kpis: rawKpis,
    entries: rawEntries,
    hiveName,
  }: {
    kpis: HistoryKpis;
    entries: HistoryEntry[];
    hiveName: string | null;
  } = await listHistoryMock('demo-user', hiveId);

  // ✅ adaptar al shape que espera HistoryClient (Kpis)
  const kpis: Kpis = {
    totalInspections: rawKpis.totalInspections,
    avgHealthPct: rawKpis.avgHealth,
    // si quieres ser precisa: convertir kg → lbs (~2.20462)
    honeyLbs: Math.round(rawKpis.totalHoneyKg * 2.20462),
  };

  // ✅ adaptar HistoryEntry → ActionEntry (añadir title / note opcional)
  const entries: ActionEntry[] = rawEntries.map((e) => {
    let title: string;
    switch (e.type) {
      case 'inspection':
        title = 'Hive inspection';
        break;
      case 'harvest':
        title = 'Honey harvest';
        break;
      case 'queen':
        title = 'Queen management';
        break;
      case 'pest':
      default:
        title = 'Pest control';
        break;
    }

    return {
      id: e.id,
      type: e.type,
      title,
      createdAt: e.createdAt,
      note: e.notes,
    };
  });

  return <HistoryClient kpis={kpis} entries={entries} hiveName={hiveName ?? undefined} />;
}
