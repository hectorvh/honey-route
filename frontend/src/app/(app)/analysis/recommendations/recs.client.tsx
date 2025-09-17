'use client';

import { useRef, useState } from 'react';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import { useI18n } from '@/i18n/I18nProvider';
import { useRouter } from 'next/navigation';

function BackBtn() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (history.length > 1 ? router.back() : router.push('/hives'))}
      aria-label="Back"
      className="grid h-9 w-9 place-items-center rounded-full bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
    >
      <span className="text-lg leading-none">←</span>
    </button>
  );
}

type RecKey = 'inspect' | 'food' | 'queen' | 'space' | 'varroa';

function Row({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-900 ring-1 ring-black/5">
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`mt-1 h-6 w-11 rounded-full p-0.5 transition ${
            checked ? 'bg-amber-400' : 'bg-neutral-700'
          }`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white transition ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-neutral-400">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// helper: si t(key) === key, usa fallback legible
const L = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

export default function RecommendationsPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [sel, setSel] = useState<Record<RecKey, boolean>>({
    inspect: false,
    food: false,
    queen: false,
    space: false,
    varroa: false,
  });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const attachmentsRef = useRef<File[]>([]);

  const toggle = (k: RecKey) => (v: boolean) => setSel((s) => ({ ...s, [k]: v }));
  const attach = () => fileRef.current?.click();
  const onPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) attachmentsRef.current = files;
    e.currentTarget.value = '';
  };

  const save = async () => {
    // Si tienes endpoint real, cámbialo aquí por un POST.
    try {
      const payload = {
        selected: sel,
        attachments: attachmentsRef.current.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      };
      sessionStorage.setItem('recommendationsDraft', JSON.stringify(payload));
    } catch {
      // noop
    }
    // ✔ navega al resultado del análisis
    router.replace('/analysis/result');
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
      contentClassName="pb-28 pt-2"
      footer={<NavTab active="home" />}
    >
      <h1 className="text-[26px] font-extrabold tracking-tight">
        {L(t, 'analysis.recs.title', 'Recommendations')}
      </h1>

      <div className="mt-4 space-y-3">
        <Row
          checked={sel.inspect}
          onChange={toggle('inspect')}
          title={L(t, 'analysis.recs.inspectTitle', 'Inspect Hive Health')}
          desc={L(
            t,
            'analysis.recs.inspectBody',
            'Check for disease/pests, ensure ventilation and space.'
          )}
        />
        <Row
          checked={sel.food}
          onChange={toggle('food')}
          title={L(t, 'analysis.recs.foodTitle', 'Check Food Stores')}
          desc={L(t, 'analysis.recs.foodBody', 'Ensure enough food; supplement if needed.')}
        />
        <Row
          checked={sel.queen}
          onChange={toggle('queen')}
          title={L(t, 'analysis.recs.queenTitle', 'Assess Queen Health')}
          desc={L(t, 'analysis.recs.queenBody', 'Look for a consistent brood pattern.')}
        />
        <Row
          checked={sel.space}
          onChange={toggle('space')}
          title={L(t, 'analysis.recs.spaceTitle', 'Manage Hive Space')}
          desc={L(t, 'analysis.recs.spaceBody', 'Add/remove supers to prevent swarming.')}
        />
        <Row
          checked={sel.varroa}
          onChange={toggle('varroa')}
          title={L(t, 'analysis.recs.varroaTitle', 'Varroa Mite Treatment')}
          desc={L(
            t,
            'analysis.recs.varroaBody',
            'Treat appropriately based on season and hive condition.'
          )}
        />
      </div>

      {/* Adjuntos */}
      <button
        type="button"
        onClick={attach}
        className="mt-5 w-full rounded-2xl px-4 py-3 text-left text-sm text-neutral-300 ring-1 ring-black/5 hover:bg-neutral-900"
      >
        + {L(t, 'analysis.recs.attach', 'Attach evidence (photos/documents)')}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={onPicked}
      />

      {/* CTA */}
      <button
        type="button"
        onClick={save}
        className="mt-4 h-12 w-full rounded-2xl bg-amber-400 font-semibold text-black shadow-lg hover:bg-amber-300"
      >
        {L(t, 'analysis.recs.save', 'Save changes')}
      </button>
    </CardShell>
  );
}
