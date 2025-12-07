//frontend/src/app/(app)/apiaries/quick-analysis/analysis/[jobId]/page.tsx
import AnalysisClient from './client';

export default function AnalysisDetailPage({ params }: { params: { jobId: string } }) {
  const { jobId } = params;
  return <AnalysisClient jobId={jobId} />;
}
