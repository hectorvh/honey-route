// frontend/src/app/(app)/analysis/result/page.tsx
//import ResultClient from './result.client';

//export default function ResultPage() {
//  return <ResultClient />;
//}

import { Suspense } from 'react';
import { AnalysisResultClient } from './AnalysisResultClient';

export const dynamic = 'force-dynamic'; // optional but often helpful here

export default function AnalysisResultPage() {
  return (
    <Suspense fallback={<div>Loading result...</div>}>
      <AnalysisResultClient />
    </Suspense>
  );
}
