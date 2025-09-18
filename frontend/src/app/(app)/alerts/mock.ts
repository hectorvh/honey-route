//frontend/src/app/(app)/alerts/mock.ts
// Tipos y datos simulados para Alerts (con coords de hive)
export type AlertType = 'temp' | 'humidity' | 'queen';
export type Severity = 'low' | 'medium' | 'high';

export type AlertItem = {
  id: string;
  type: AlertType;
  severity: Severity;
  createdAt: string; // ISO
  hive: { id: string; name: string; lat: number; lng: number };
  /** Causa / resumen (detalle) */
  title: string;
  /** Texto corto que mostramos en la lista (opcional) */
  listText?: string;
};

const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

// Coordenadas de Brasilia como base
const BRASILIA = { lat: -15.793889, lng: -47.882778 };

export function getMockAlerts(): AlertItem[] {
  return [
    {
      id: 'a1',
      type: 'temp',
      severity: 'high',
      createdAt: daysAgo(2),
      hive: { id: 'hive-1', name: 'Hive 1', lat: BRASILIA.lat + 0.01, lng: BRASILIA.lng - 0.01 },
      title: 'High temperature detected',
      listText: 'High Temperature',
    },
    {
      id: 'a2',
      type: 'humidity',
      severity: 'medium',
      createdAt: daysAgo(3),
      hive: { id: 'hive-2', name: 'Hive 2', lat: BRASILIA.lat - 0.008, lng: BRASILIA.lng + 0.014 },
      title: 'Humidity out of optimal range',
      listText: 'Humidity Alert',
    },
    {
      id: 'a3',
      type: 'queen',
      severity: 'high',
      createdAt: daysAgo(6),
      hive: { id: 'hive-3', name: 'Hive 3', lat: BRASILIA.lat - 0.02, lng: BRASILIA.lng - 0.012 },
      title: 'Queen status requires attention',
      listText: 'Queen Status',
    },
    {
      id: 'a4',
      type: 'temp',
      severity: 'low',
      createdAt: daysAgo(10),
      hive: { id: 'hive-4', name: 'Hive 4', lat: BRASILIA.lat + 0.016, lng: BRASILIA.lng + 0.006 },
      title: 'Low temperature detected',
      listText: 'Low Temperature',
    },
  ];
}
