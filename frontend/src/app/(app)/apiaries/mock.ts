// frontend/src/app/(app)/apiaries/mock.ts
import { getDemoApiaries, getDemoHives, type DemoApiary } from '@/mocks/demoGuestProfile';

export type ApiaryCard = {
  id: string;
  name: string;
  hiveCount: number;
  status: 'healthy' | 'attention' | 'critical';
  imageUrl?: string;
};

// opcional: map de imágenes por apiario demo
const APIARY_IMAGES: Record<string, string> = {
  'apiary-azul': '/images/apiary-azul2.png',
  'apiary-hector': '/images/apiary-hector.png',
};

// status del apiario según sus colmenas
function inferApiaryStatus(apiaryId: string): ApiaryCard['status'] {
  const hives = getDemoHives(apiaryId);

  if (!hives.length) return 'healthy';

  if (hives.some((h) => h.status === 'critical')) return 'critical';
  if (hives.some((h) => h.status === 'attention')) return 'attention';
  return 'healthy';
}

export function getMockApiaryCards(): ApiaryCard[] {
  const apiaries: DemoApiary[] = getDemoApiaries();

  return apiaries.map((a) => {
    const hives = getDemoHives(a.id);

    return {
      id: a.id,
      name: a.name,
      hiveCount: hives.length,
      status: inferApiaryStatus(a.id),
      imageUrl: APIARY_IMAGES[a.id],
    };
  });
}
