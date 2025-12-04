export type AlertType = 'temp' | 'humidity' | 'queen';
export type Severity = 'low' | 'medium' | 'high';

export type AlertItem = {
  id: string;
  type: AlertType;
  severity: Severity;
  createdAt: string; // ISO
  hive: { id: string; name: string; lat: number; lng: number };

  /** Texto en detalle (fallback en inglés si falta i18n) */
  title: string;
  /** Key i18n para título (lista/detalle) */
  titleKey?: string;

  /** Texto corto para lista (fallback en inglés) */
  listText?: string;
  /** Key i18n para lista */
  listKey?: string;
};

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
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
      titleKey: 'alerts.items.a1.title',
      listText: 'High Temperature',
      listKey: 'alerts.items.a1.list',
    },
    {
      id: 'a2',
      type: 'humidity',
      severity: 'medium',
      createdAt: daysAgo(3),
      hive: { id: 'hive-2', name: 'Hive 2', lat: BRASILIA.lat - 0.008, lng: BRASILIA.lng + 0.014 },
      title: 'Humidity out of optimal range',
      titleKey: 'alerts.items.a2.title',
      listText: 'Humidity Alert',
      listKey: 'alerts.items.a2.list',
    },
    {
      id: 'a3',
      type: 'queen',
      severity: 'high',
      createdAt: daysAgo(6),
      hive: { id: 'hive-3', name: 'Hive 3', lat: BRASILIA.lat - 0.02, lng: BRASILIA.lng - 0.012 },
      title: 'Queen status requires attention',
      titleKey: 'alerts.items.a3.title',
      listText: 'Queen Status',
      listKey: 'alerts.items.a3.list',
    },
    {
      id: 'a4',
      type: 'temp',
      severity: 'low',
      createdAt: daysAgo(10),
      hive: { id: 'hive-4', name: 'Hive 4', lat: BRASILIA.lat + 0.016, lng: BRASILIA.lng + 0.006 },
      title: 'Low temperature detected',
      titleKey: 'alerts.items.a4.title',
      listText: 'Low Temperature',
      listKey: 'alerts.items.a4.list',
    },
  ];
}
