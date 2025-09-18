import AnalysisClient from './client';

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <AnalysisClient jobId={jobId} />;
}
