'use client';
import { useRouter } from 'next/navigation';

export default function BackBtn({ hrefFallback = '/hives' }: { hrefFallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back();
        else router.push(hrefFallback);
      }}
      aria-label="Back"
      className="grid h-9 w-9 place-items-center rounded-full bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
    >
      <span className="text-lg leading-none">←</span>
    </button>
  );
}
