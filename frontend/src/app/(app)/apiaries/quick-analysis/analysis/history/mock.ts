export type HistoryEntryType = 'inspection' | 'harvest' | 'queen' | 'pest';

export type HistoryEntry = {
  id: string;
  type: HistoryEntryType;
  createdAt: string; // ISO
  notes: string;
};

export type HistoryKpis = {
  totalInspections: number;
  avgHealth: number; // 0–100
  totalHoneyKg: number;
};

export async function listHistoryMock(
  userId: string,
  hiveId: string | null
): Promise<{ kpis: HistoryKpis; entries: HistoryEntry[]; hiveName: string | null }> {
  // Demo dummy – luego lo cambias por API real
  const hiveName = hiveId ?? 'Hive A-01 · Rooftop';

  const kpis: HistoryKpis = {
    totalInspections: 12,
    avgHealth: 82,
    totalHoneyKg: 34,
  };

  const entries: HistoryEntry[] = [
    {
      id: 'h1',
      type: 'inspection',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // hace 2h
      notes: 'Routine inspection; brood pattern normal.',
    },
    {
      id: 'h2',
      type: 'harvest',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // hace 3 días
      notes: 'Light honey harvest from top super.',
    },
    {
      id: 'h3',
      type: 'pest',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // hace 7 días
      notes: 'Varroa treatment applied (OA vapor).',
    },
  ];

  return {
    kpis,
    entries,
    hiveName,
  };
}
