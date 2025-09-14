'use client';
import { useRouter } from 'next/navigation';
export default function CapturePage() {
  const router = useRouter();
  const start = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis`, { method: 'POST' });
    const data = await res.json();
    router.push(`/analysis/${data.jobId}`);
  };
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Capture</h1>
      <button onClick={start} className="mt-4 px-4 py-2 rounded bg-black text-white">
        Start analysis
      </button>
    </main>
  );
}
