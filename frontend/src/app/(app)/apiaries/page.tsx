//frontend/src/app/(app)/apiaries/page.tsx
import ApiariesClient from './ApiariesClient';
import { getMockApiaries } from './mock';

// Server Component simple: sin Supabase, sólo mocks.
export default function ApiariesPage() {
  const cards = getMockApiaries();
  return <ApiariesClient cards={cards} />;
}
