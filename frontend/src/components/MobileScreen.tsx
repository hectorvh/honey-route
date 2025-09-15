// frontend/src/components/MobileScreen.tsx
import { cn } from '@/lib/cn';

export default function MobileScreen({
  children,
  headerLeft,
  headerRight,
  contentClassName,
}: {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex items-center justify-center p-4">
      <div className="flex items-center justify-between px-5 py-4">
        <div>{headerLeft}</div>
        <div>{headerRight}</div>
      </div>
      <div className={cn('px-6 pb-8 pt-4 overflow-y-auto', contentClassName)}>{children}</div>
    </div>
  );
}
