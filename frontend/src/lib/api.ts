// Pequeño cliente para hablar con el backend mock (POST /analysis, GET /analysis/:jobId)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type Detection = {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
};

export type StartAnalysisResponse = { jobId: string };

export type AnalysisStatusResponse = {
  status: 'queued' | 'processing' | 'done' | 'error';
  progress?: number; // 0..100
  riskLevel?: 'low' | 'medium' | 'high';
  detections?: Detection[];
  error?: string;
};

export type AnalysisPayload = {
  images: string[]; // DataURLs base64 (mock)
  video?: string | null; // opcional (DataURL)
};

export async function startAnalysis(payload: AnalysisPayload): Promise<StartAnalysisResponse> {
  const res = await fetch(`${API_URL}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`startAnalysis failed (${res.status})`);
  return res.json();
}

export async function getAnalysis(jobId: string): Promise<AnalysisStatusResponse> {
  const res = await fetch(`${API_URL}/analysis/${encodeURIComponent(jobId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`getAnalysis failed (${res.status})`);
  return res.json();
}
