'use client';

import { useEffect, useState } from 'react';

type RiskLevel = 'low' | 'medium' | 'high';
type JobStatus = 'queued' | 'running' | 'done' | 'error';

type Detection = {
  id: string;
  label: string;
  confidence: number; // 0..1
};

type AnalysisResult = {
  jobId: string;
  status: JobStatus;
  progress?: number; // 0..100
  riskLevel?: RiskLevel;
  detections?: Detection[];
  error?: string;
};

export default function AnalysisClient({ jobId }: { jobId: string }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError(
        'Missing NEXT_PUBLIC_API_URL. Set it in frontend/.env.local (e.g., http://localhost:3001).'
      );
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/analysis/${encodeURIComponent(jobId)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Request failed (${res.status})${text ? `: ${text}` : ''}`);
        }

        const json = (await res.json()) as AnalysisResult;
        setData(json);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        const msg = e instanceof Error ? e.message : 'Unknown error fetching analysis';
        setError(msg);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [API_URL, jobId]);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Analysis {jobId}</h1>

      {loading && <p className="mt-4 text-sm text-neutral-600">Loading analysis…</p>}

      {error && (
        <p className="mt-4 rounded bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      {!loading && !error && data && (
        <section className="mt-4 space-y-4">
          <div className="rounded-lg bg-neutral-100 p-3">
            <p className="text-sm">
              <span className="font-semibold">Status:</span> {data.status}
              {typeof data.progress === 'number' ? ` (${data.progress}%)` : ''}
            </p>
            {data.riskLevel && (
              <p className="text-sm">
                <span className="font-semibold">Risk:</span> {data.riskLevel}
              </p>
            )}
          </div>

          {Array.isArray(data.detections) && data.detections.length > 0 && (
            <div className="rounded-lg bg-neutral-100 p-3">
              <p className="mb-2 text-sm font-semibold">Detections</p>
              <ul className="space-y-1 text-sm">
                {data.detections.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between rounded bg-white px-3 py-2 ring-1 ring-black/5"
                  >
                    <span>{d.label}</span>
                    <span className="tabular-nums">{(d.confidence * 100).toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <pre className="whitespace-pre-wrap rounded bg-neutral-50 p-3 text-xs ring-1 ring-black/5">
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
