'use client';
export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 text-neutral-600 break-all">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 rounded bg-black text-white">
        Reintentar
      </button>
    </main>
  );
}
