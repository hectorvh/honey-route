// frontend/src/app/(app)/analysis/result/AnalysisResultClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export function AnalysisResultClient() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  // Your existing logic / JSX here
  // e.g.
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Analysis result</h1>
      <p>Job ID: {jobId ?? 'No job id provided'}</p>
      {/* ...rest of your UI... */}
    </div>
  );
}
