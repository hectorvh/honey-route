'use client';

import { ChangeEvent } from 'react';

export type Option<V extends string> = Readonly<{ label: string; value: V }>;
export type SelectProps<V extends string> = {
  value: V;
  onChange: (v: V) => void;
  options: ReadonlyArray<Option<V>>;
  className?: string;
};

export default function Select<V extends string>({
  value,
  onChange,
  options,
  className,
}: SelectProps<V>) {
  const handle = (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as V);
  const base =
    'w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none ring-0 focus:border-neutral-700';

  return (
    <select value={value} onChange={handle} className={className ? `${base} ${className}` : base}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
