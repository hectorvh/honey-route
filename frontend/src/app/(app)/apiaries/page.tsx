// frontend/src/app/(app)/apiaries/page.tsx
import ApiariesClient from './ApiariesClient';
import { getMockApiaryCards } from './mock';

// Server Component simple: sin Supabase, sólo mocks.
export default function ApiariesPage() {
  const cards = getMockApiaryCards();
  return <ApiariesClient cards={cards} />;
}
