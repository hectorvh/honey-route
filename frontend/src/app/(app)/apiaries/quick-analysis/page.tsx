// frontend/src/app/(app)/apiaries/quick-analysis/page.tsx
import { Suspense } from 'react';
import QuickAnalysisClient from './QuickAnalysisClient';

export default function QuickAnalysisPage() {
  return (
    <Suspense fallback={null}>
      <QuickAnalysisClient />
    </Suspense>
  );
}
