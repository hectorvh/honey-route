// Mocks para /hives.
// Construimos el apiario "Azul's Bees" con las 4 colmenas que ya aparecen en alerts/map.
//frontend/src/app/(app)/apiaries/mock.ts
import { getMockAlerts } from '@/app/(app)/alerts/mock';

export type ApiaryStatus = 'healthy' | 'attention' | 'critical';

export type ApiaryCard = {
  id: string;
  name: string;
  hiveCount: number;
  status: ApiaryStatus;
  imageUrl?: string; // opcional: si no hay, usamos un fondo degradado
};

export function getMockApiaries(): ApiaryCard[] {
  const alerts = getMockAlerts();

  // Dedupe de colmenas por id (salen 4)
  const hiveIds = new Set(alerts.map((a) => a.hive.id));
  const hiveCount = hiveIds.size;

  // Severidad más alta → estado del apiario
  const hasHigh = alerts.some((a) => a.severity === 'high');
  const hasMedium = alerts.some((a) => a.severity === 'medium');

  let status: ApiaryStatus = 'healthy';
  if (hasHigh) status = 'critical';
  else if (hasMedium) status = 'attention';

  return [
    {
      id: 'api-azul',
      name: "Azul's Bees",
      hiveCount,
      status,
      // imageUrl opcional; si no la tienes, déjala undefined para usar fallback
      imageUrl: '/images/apiary1.png',
    },
  ];
}
