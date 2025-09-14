import * as React from 'react';
import { cn } from '@/lib/cn';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, error, ...props },
  ref
) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm text-neutral-300">{label}</span>}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-2xl border bg-neutral-900/60 text-white placeholder:text-neutral-400',
          'border-neutral-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50',
          'h-12 px-4',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-sm text-red-400">{error}</span>}
    </label>
  );
});

export default Input;
