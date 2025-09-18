import type { ActionEntry, Kpis } from '@/app/(app)/analysis/history/HistoryClient';

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

export async function listHistoryMock(
  _userId: string,
  hiveId: string | null
): Promise<{ kpis: Kpis; entries: ActionEntry[]; hiveName?: string }> {
  // Puedes mapear nombres reales si vienes de /map o /alerts
  const hiveNames: Record<string, string> = {
    'hive-1': 'Hive 1',
    'hive-2': 'Hive 2',
    'hive-3': 'Hive 3',
    'hive-4': 'Hive 4',
  };

  // Datos simulados (puedes asignar mentalmente cada entry a un hive distinto si quieres filtrar)
  const all: ActionEntry[] = [
    {
      id: 'e1',
      type: 'inspection',
      title: 'Routine inspection',
      createdAt: daysAgo(1),
      note: 'No issues.',
    },
    {
      id: 'e2',
      type: 'queen',
      title: 'Queen check',
      createdAt: daysAgo(3),
      note: 'Even brood pattern.',
    },
    {
      id: 'e3',
      type: 'harvest',
      title: 'Honey harvest',
      createdAt: daysAgo(7),
      note: '~8 lbs extracted.',
    },
    {
      id: 'e4',
      type: 'pest',
      title: 'Varroa treatment',
      createdAt: daysAgo(10),
      note: 'OA vaporization.',
    },
  ];

  // Si quieres aplicar filtro por hive, aquí podrías separar por IDs;
  // por ahora devolvemos todos para mantener la demo simple.
  const entries = all;

  const kpis: Kpis = {
    totalInspections: 12,
    avgHealthPct: 86,
    honeyLbs: 37,
  };

  const hiveName = hiveId ? hiveNames[hiveId] : undefined;
  return { kpis, entries, hiveName };
}
