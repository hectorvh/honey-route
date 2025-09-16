// BrandMark.tsx (snippet)
import Image from 'next/image';

export default function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/icons/logo-honeyroute-amber-1024.png" alt="HoneyRoute" width={20} height={20} />
      <span className="text-base font-semibold">HoneyRoute</span>
    </div>
  );
}
