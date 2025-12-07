//frontend/src/app/(app)/apiaries/quick-analysis/analysis/upload/UploadClient.tsx
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

type Picked = { id: string; url: string };

export default function UploadPage() {
  const { t } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<Picked[]>([]);
  const canAdd = items.length < 5;

  const openPicker = () => inputRef.current?.click();

  const onFiles = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(ev.target.files ?? []).slice(0, 5 - items.length);
    if (files.length === 0) return;

    const readers = files.map(
      (f) =>
        new Promise<Picked>((resolve) => {
          const fr = new FileReader();
          fr.onload = () =>
            resolve({ id: `${f.name}-${Date.now()}`, url: String(fr.result || '') });
          fr.readAsDataURL(f);
        })
    );

    Promise.all(readers).then((res) => setItems((prev) => [...prev, ...res]));
    ev.target.value = '';
  };

  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const confirm = () => {
    if (items.length === 0) return;
    try {
      const payload = { images: items.map((i) => i.url), video: null as string | null };
      sessionStorage.setItem('quickAnalysisPayload', JSON.stringify(payload));
    } catch {}
    router.push('/apiaries/quick-analysis');
  };

  return (
    <CardShell
      headerLeft={
        <div className="flex items-center gap-2">
          <BackBtn />
          <BrandMark />
        </div>
      }
      headerRight={<LangToggle />}
      contentClassName="pb-28"
      footer={<NavTab active="home" />}
    >
      <h1 className="text-[22px] font-bold">{t('analysis.upload.title') ?? 'Add Images'}</h1>
      <p className="mt-1 text-sm text-neutral-400">
        {t('analysis.upload.subtitle') ?? 'Select up to 5 clear, well-lit images.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="relative h-40 overflow-hidden rounded-2xl ring-1 ring-black/5"
          >
            <Image
              src={it.url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:420px) 50vw, 210px"
            />
            <div className="absolute left-2 top-2 rounded-full bg-black/50 p-1 backdrop-blur">
              <Image src="/images/check.png" alt="" width={18} height={18} />
            </div>
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur hover:bg-black/60"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Slots vacíos */}
        {canAdd &&
          Array.from({ length: 5 - items.length }).map((_, idx) => (
            <button
              type="button"
              key={`empty-${idx}`}
              onClick={openPicker}
              className="grid h-40 place-items-center rounded-2xl bg-neutral-900 ring-1 ring-black/5 hover:bg-neutral-800"
              aria-label={t('analysis.upload.addImage') ?? 'Add Image'}
            >
              <Image
                src="/images/addImage.png"
                alt=""
                width={26}
                height={26}
                className="filter invert brightness-0"
              />
            </button>
          ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFiles}
        className="hidden"
      />

      <button
        type="button"
        onClick={confirm}
        disabled={items.length === 0}
        className="mt-6 h-12 w-full rounded-2xl bg-amber-400 font-semibold text-black shadow hover:bg-amber-300 disabled:opacity-50"
      >
        {t('analysis.upload.confirm') ?? 'Confirm Upload'}
      </button>
    </CardShell>
  );
}
