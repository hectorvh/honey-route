// frontend/src/app/(app)/analysis/result/page.tsx
import { Suspense } from 'react';
import ResultClient from './result.client';

export const dynamic = 'force-dynamic';

export default function AnalysisResultPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-neutral-400">Loading result...</div>}>
      <ResultClient />
    </Suspense>
  );
}
