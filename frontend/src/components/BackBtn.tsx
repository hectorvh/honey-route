// frontend/src/components/BackBtn.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';

type BackBtnProps = {
  to?: string; // ruta fija opcional
};

export default function BackBtn({ to }: BackBtnProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // 1) Ruta fija explícita gana
    if (to) {
      router.push(to);
      return;
    }

    // 2) Flujo de análisis: solo para loader + result
    if (
      pathname === '/apiaries/quick-analysis/analysis' ||
      pathname === '/apiaries/quick-analysis/analysis/result'
    ) {
      router.push('/apiaries/quick-analysis');
      return;
    }

    // 3) Genérico: usa history, y si no hay, ve a /apiaries
    if (history.length > 1) {
      router.back();
    } else {
      router.push('/apiaries');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back"
      className="grid h-9 w-9 place-items-center rounded-full bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
    >
      <span className="text-lg leading-none">←</span>
    </button>
  );
}
