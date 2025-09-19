//frontend/src/app/(app)/apiaries/[apiaryId]/page.tsx
import ApiaryDetailClient from './ApiaryDetailClient';

export default async function ApiaryDetailPage({
  params,
}: {
  params: Promise<{ apiaryId: string }>;
}) {
  const { apiaryId } = await params; // ✅ esperar params
  return <ApiaryDetailClient apiaryId={apiaryId} />;
}
