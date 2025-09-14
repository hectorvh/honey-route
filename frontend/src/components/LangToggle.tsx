'use client';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';

export default function LangToggle({
  className,
  enLabel = 'EN',
  esLabel = 'ES',
  size = 'sm',
}: {
  className?: string;
  enLabel?: string;
  esLabel?: string;
  size?: 'sm' | 'md';
}) {
  const { locale, setLocale } = useI18n();
  const isEN = locale === 'en';
  const w = size === 'md' ? 'w-12 h-6' : 'w-10 h-5';
  const knob = size === 'md' ? (isEN ? 'left-0.5' : 'left-6') : isEN ? 'left-0.5' : 'left-5';
  const knobSize = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-[11px] font-medium text-neutral-300 select-none',
        className
      )}
    >
      <span className={isEN ? 'text-white' : ''}>{enLabel}</span>
      <button
        aria-label="toggle language"
        onClick={() => setLocale(isEN ? 'es' : 'en')}
        className={cn('relative rounded-full bg-neutral-700 ring-1 ring-white/10 outline-none', w)}
      >
        <span
          className={cn('absolute top-0.5 rounded-full bg-white transition-all', knob, knobSize)}
        />
      </button>
      <span className={!isEN ? 'text-white' : ''}>{esLabel}</span>
    </div>
  );
}
