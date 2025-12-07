// frontend/src/data/history.mock.ts
import { demoHives } from '@/mocks/demoGuestProfile';

export type HistoryKpis = {
  totalInspections: number;
  avgHealthPct: number;
  honeyLbs: number;
};

export type HistoryEntry = {
  id: string;
  type: 'inspection' | 'harvest' | 'queen' | 'pest';
  title: string;
  createdAt: string;
  note?: string;
};

type InternalEntry = HistoryEntry & { hiveId: string };

const NOW = Date.now();
const minutesAgo = (min: number) => new Date(NOW - min * 60_000).toISOString();

/**
 * Historia alineada con el demo:
 *
 * - Hive A-01 · Rooftop  → temp alta → inspecciones + ajuste de ventilación
 * - Hive A-02 · Shaded   → humedad alta → revisión + ajuste de airflow
 * - Hive A-03 · Experimental → reina dudosa → inspección, marcado, posible recambio
 * - Hive H-01 · Hillside → temp baja leve → monitoreo
 * - Hive H-02 · Windy    → humedad baja → cierre parcial, monitoreo
 */
const ALL_ENTRIES: InternalEntry[] = [
  // A-03: la crítica
  {
    id: 'h-a03-1',
    hiveId: 'hive-azul-a03',
    type: 'inspection',
    title: 'Brood pattern inspection',
    createdAt: minutesAgo(180),
    note: 'Detected patchy brood pattern and reduced egg laying.',
  },
  {
    id: 'h-a03-2',
    hiveId: 'hive-azul-a03',
    type: 'queen',
    title: 'Queen status follow-up',
    createdAt: minutesAgo(90),
    note: 'Marked current queen; considering requeening if pattern does not improve.',
  },

  // A-01: temperatura alta
  {
    id: 'h-a01-1',
    hiveId: 'hive-azul-a01',
    type: 'inspection',
    title: 'Rooftop temperature check',
    createdAt: minutesAgo(240),
    note: 'Brood nest running hot during peak sun hours; tested extra ventilation.',
  },
  {
    id: 'h-a01-2',
    hiveId: 'hive-azul-a01',
    type: 'pest',
    title: 'Varroa quick check',
    createdAt: minutesAgo(200),
    note: 'No significant mite load detected in sample.',
  },

  // A-02: humedad alta
  {
    id: 'h-a02-1',
    hiveId: 'hive-azul-a02',
    type: 'inspection',
    title: 'Humidity and condensation review',
    createdAt: minutesAgo(360),
    note: 'Condensation on inner cover; adjusted ventilation and entrance reducer.',
  },

  // H-02: humedad baja (viento)
  {
    id: 'h-h02-1',
    hiveId: 'hive-hector-h02',
    type: 'inspection',
    title: 'Wind exposure check',
    createdAt: minutesAgo(300),
    note: 'Dry, windy conditions; added partial windbreak on north side.',
  },

  // H-01: evento frío leve
  {
    id: 'h-h01-1',
    hiveId: 'hive-hector-h01',
    type: 'inspection',
    title: 'Overnight temperature dip',
    createdAt: minutesAgo(420),
    note: 'Short low-temperature event before sunrise; colony recovered quickly.',
  },

  // Un par de cosechas generales para kpis
  {
    id: 'h-a01-harvest-1',
    hiveId: 'hive-azul-a01',
    type: 'harvest',
    title: 'Rooftop super harvest',
    createdAt: minutesAgo(1440),
    note: 'Harvested one shallow super (~25 lbs).',
  },
  {
    id: 'h-h01-harvest-1',
    hiveId: 'hive-hector-h01',
    type: 'harvest',
    title: 'Hillside spring harvest',
    createdAt: minutesAgo(2880),
    note: 'Early spring harvest (~30 lbs) with strong floral diversity.',
  },
];

export async function listHistoryMock(userId: string, hiveId?: string | null) {
  // filtrado por hive si viene de /analysis/result o /alerts detail
  const filteredInternal = hiveId ? ALL_ENTRIES.filter((e) => e.hiveId === hiveId) : ALL_ENTRIES;

  const entries: HistoryEntry[] = filteredInternal.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    createdAt: e.createdAt,
    note: e.note,
  }));
  // Hives que entran al cálculo de KPIs
  const scopeHives = hiveId ? demoHives.filter((h) => h.id === hiveId) : demoHives;

  const totalInspections = filteredInternal.filter((e) => e.type === 'inspection').length || 3;

  const avgHealthPct =
    scopeHives.length > 0
      ? Math.round(scopeHives.reduce((sum, h) => sum + h.healthScore, 0) / scopeHives.length)
      : 80;

  const honeyLbs =
    filteredInternal.filter((e) => e.type === 'harvest').length > 0
      ? 55 // 25 + 30 aprox
      : 0;

  const hiveName = hiveId ? scopeHives.find((h) => h.id === hiveId)?.label : undefined;

  return {
    kpis: {
      totalInspections,
      avgHealthPct,
      honeyLbs,
    } as HistoryKpis,
    entries,
    hiveName,
  };
}
