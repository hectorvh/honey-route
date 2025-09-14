'use client';
import { useEffect, useState } from 'react';
export default function AnalysisDetail({ params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis/${jobId}`)
      .then((r) => r.json())
      .then(setData);
  }, [jobId]);
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Analysis {jobId}</h1>
      <pre className="mt-4 bg-gray-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
