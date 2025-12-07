export type {
  ActionEntry,
  Kpis,
} from '@/app/(app)/apiaries/quick-analysis/analysis/history/HistoryClient';

import type {
  ActionEntry,
  Kpis,
} from '@/app/(app)/apiaries/quick-analysis/analysis/history/HistoryClient';

export async function listHistory(
  userId: string,
  hiveId: string | null
): Promise<{ kpis: Kpis; entries: ActionEntry[]; hiveName?: string }> {
  // TODO: reemplazar por fetch a tu backend / DB.
  // Datos simulados (dependerán de userId/hiveId si hace falta).
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const entries: ActionEntry[] = [
    {
      id: 'a1',
      type: 'inspection',
      title: 'Hive Inspection',
      createdAt: new Date(now - 2 * day).toISOString(),
      note: 'General check; no issues.',
    },
    {
      id: 'a2',
      type: 'harvest',
      title: 'Honey Harvest',
      createdAt: new Date(now - 7 * day).toISOString(),
      note: 'Light harvest from top super.',
    },
    {
      id: 'a3',
      type: 'queen',
      title: 'Queen Introduction',
      createdAt: new Date(now - 14 * day).toISOString(),
    },
    {
      id: 'a4',
      type: 'pest',
      title: 'Pest Control',
      createdAt: new Date(now - 21 * day).toISOString(),
      note: 'OA vaporization.',
    },
  ];

  const kpis: Kpis = {
    totalInspections: 12,
    avgHealthPct: 85,
    honeyLbs: 250,
  };

  return {
    kpis,
    entries,
    hiveName: hiveId ? `Apiary ${hiveId.slice(0, 4).toUpperCase()}` : undefined,
  };
}
