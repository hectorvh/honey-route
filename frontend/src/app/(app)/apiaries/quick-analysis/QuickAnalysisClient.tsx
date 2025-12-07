'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import BackBtn from '@/components/BackBtn';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

import {
  getDemoApiaries,
  getDemoHives as getDemoHivesForApiary,
  type DemoHive as MockHive,
} from '@/mocks/demoGuestProfile';

import { useQuickHives, type DemoHive, type QuickHive } from './useQuickHives';

type QuickPayload = {
  images: string[];
  video: string | null;
};

type AnalysisMeta = {
  apiaryId?: string | null;
  apiaryName?: string | null;
  hiveId?: string | null;
  hiveLabel?: string | null;
  source?: string | null;
};

type AnalysisPayload = {
  images?: string[];
  video?: string | null;
  meta?: AnalysisMeta;
};

// Apiarios simplificados solo para este flujo
type QAApiary = {
  id: string;
  name: string;
};

type LocalApiary = {
  id: string;
  name?: string | null;
};

const tv = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
    return [];
  } catch {
    return [];
  }
}

export default function QuickAnalysisClient() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();

  // -------- DEMO APIARIES (solo id + name) --------
  const demoApiaries = useMemo<QAApiary[]>(
    () =>
      getDemoApiaries().map((a) => ({
        id: a.id,
        name: a.name,
      })),
    []
  );

  // apiaries = demo + locales (hr.apiaries)
  const [apiaries, setApiaries] = useState<QAApiary[]>(demoApiaries);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setApiaries(demoApiaries);
      return;
    }

    try {
      const stored = safeParseArray<LocalApiary>(localStorage.getItem('hr.apiaries'));
      if (!stored.length) {
        setApiaries(demoApiaries);
        return;
      }

      const demoIds = new Set(demoApiaries.map((a) => a.id));
      const locals: QAApiary[] = stored
        .filter((a) => a && typeof a.id === 'string')
        .map((a) => ({
          id: a.id,
          name: a.name ?? 'My Apiary',
        }));

      const onlyNew = locals.filter((a) => !demoIds.has(a.id));
      setApiaries([...demoApiaries, ...onlyNew]);
    } catch {
      setApiaries(demoApiaries);
    }
  }, [demoApiaries]);

  // -------- DEMO HIVES PARA EL HOOK (incluye apiaryId) --------
  const demoHivesForHook = useMemo<DemoHive[]>(() => {
    return getDemoApiaries().flatMap((a) => {
      const raw: MockHive[] = getDemoHivesForApiary(a.id) ?? [];
      return raw.map(
        (h): DemoHive => ({
          id: h.id,
          apiaryId: a.id,
          label: h.label,
          apiaryName: a.name,
          lat: h.lat ?? null,
          lng: h.lng ?? null,
        })
      );
    });
  }, []);

  // quick hives = demo + locales (hr.hives)
  const allHives: QuickHive[] = useQuickHives(demoHivesForHook);

  // -------- SELECCIÓN APIARY + HIVE --------
  const [selectedApiaryId, setSelectedApiaryId] = useState<string>('');
  const [selectedHiveId, setSelectedHiveId] = useState<string>('');

  const apiaryFromQS = sp.get('apiaryId');
  const lockedApiaryId = apiaryFromQS || null;

  useEffect(() => {
    if (!apiaries.length) return;

    if (lockedApiaryId) {
      setSelectedApiaryId(lockedApiaryId);
    } else if (!selectedApiaryId) {
      setSelectedApiaryId(apiaries[0].id);
    }
  }, [apiaries, lockedApiaryId, selectedApiaryId]);

  const selectedApiary =
    selectedApiaryId && apiaries.length
      ? (apiaries.find((a) => a.id === selectedApiaryId) ?? null)
      : null;

  const hivesForSelected: QuickHive[] = useMemo(
    () => allHives.filter((h) => h.apiaryId === selectedApiaryId),
    [allHives, selectedApiaryId]
  );

  // -------- MEDIA desde quickAnalysisPayload --------
  const [payload, setPayload] = useState<QuickPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem('quickAnalysisPayload');
      if (!raw) {
        setPayload(null);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<QuickPayload>;
      const images = Array.isArray(parsed.images)
        ? parsed.images.filter((x): x is string => typeof x === 'string')
        : [];
      const video = typeof parsed.video === 'string' ? parsed.video : null;
      setPayload({ images, video });
    } catch {
      setPayload(null);
    }
  }, []);

  const hasApiary = apiaries.length > 0;
  const hasMedia = !!(payload && ((payload.images?.length ?? 0) > 0 || payload.video));

  const mediaSummary =
    !payload || (!payload.images?.length && !payload.video)
      ? tv(
          t,
          'quickAnalysis.mediaEmpty',
          'No media yet. Capture or upload at least one image before running analysis.'
        )
      : (() => {
          const imgCount = payload.images?.length ?? 0;
          const parts: string[] = [];
          if (imgCount > 0) {
            parts.push(
              imgCount === 1
                ? tv(t, 'quickAnalysis.mediaOneImage', '1 image selected')
                : tv(t, 'quickAnalysis.mediaManyImages', `${imgCount} images selected`)
            );
          }
          if (payload.video) {
            parts.push(tv(t, 'quickAnalysis.mediaVideoAttached', '1 video attached (optional)'));
          }
          return parts.join(' · ');
        })();

  // -------- RUN ANALYSIS --------
  const runAnalysis = () => {
    setError(null);

    if (!selectedApiaryId) {
      setError(tv(t, 'quickAnalysis.error.noApiary', 'Please select an apiary.'));
      return;
    }

    if (!selectedHiveId) {
      setError(tv(t, 'quickAnalysis.error.noHive', 'Please select a hive to run the analysis.'));
      return;
    }

    if (!hasMedia || !payload) {
      setError(
        tv(
          t,
          'quickAnalysis.error.noMedia',
          'Please add at least one photo before running the analysis.'
        )
      );
      return;
    }

    const hive = hivesForSelected.find((h) => h.id === selectedHiveId) ?? null;

    const meta: AnalysisMeta = {
      apiaryId: selectedApiary?.id ?? null,
      apiaryName: selectedApiary?.name ?? null,
      hiveId: hive?.id ?? selectedHiveId,
      hiveLabel: hive?.label ?? null,
      source: 'quick-analysis',
    };

    const finalPayload: AnalysisPayload = {
      images: payload.images,
      video: payload.video,
      meta,
    };

    try {
      sessionStorage.setItem('analysisPayload', JSON.stringify(finalPayload));
      sessionStorage.setItem('analysisMeta', JSON.stringify(meta));
    } catch {
      // demo: si truena, igual intentamos seguir
    }

    router.push('/apiaries/quick-analysis/analysis');
  };

  return (
    <CardShell
      headerLeft={
        <div className="flex items-center gap-2">
          <BackBtn to="/apiaries" />
          <BrandMark />
        </div>
      }
      headerRight={<LangToggle />}
      footer={<NavTab active="home" />}
      contentClassName="pb-20 pt-2"
    >
      <h1 className="text-[22px] font-extrabold tracking-tight">
        {tv(t, 'quickAnalysis.title', 'Quick Analysis')}
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        {tv(
          t,
          'quickAnalysis.subtitle',
          'Choose an apiary and hive, add photos, then run a full AI analysis.'
        )}
      </p>

      {!hasApiary && (
        <div className="mt-4 rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-200 ring-1 ring-black/5">
          <p>
            {tv(t, 'quickAnalysis.noApiary', 'You need at least one apiary to run Quick Analysis.')}
          </p>
        </div>
      )}

      {hasApiary && (
        <div className="mt-4 space-y-4">
          {/* APIARY */}
          <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5 text-sm">
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {tv(t, 'quickAnalysis.apiaryLabel', 'Apiary')}
            </label>
            <select
              className="mt-2 w-full rounded-xl bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none ring-1 ring-black/40 disabled:opacity-60"
              value={selectedApiaryId}
              disabled={!!lockedApiaryId}
              onChange={(e) => {
                setSelectedApiaryId(e.target.value);
                setSelectedHiveId('');
              }}
            >
              <option value="">
                {tv(t, 'quickAnalysis.apiaryPlaceholder', 'Select an apiary')}
              </option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {lockedApiaryId && (
              <p className="mt-1 text-xs text-neutral-500">
                {tv(
                  t,
                  'quickAnalysis.apiaryLocked',
                  'Apiary selected from details page (you can change it from Home).'
                )}
              </p>
            )}
          </div>

          {/* HIVE (mock + local) */}
          <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5 text-sm">
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {tv(t, 'quickAnalysis.hiveLabel', 'Hive')}
            </label>
            <select
              className="mt-2 w-full rounded-xl bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none ring-1 ring-black/40"
              value={selectedHiveId}
              onChange={(e) => setSelectedHiveId(e.target.value)}
              disabled={!selectedApiaryId}
            >
              <option value="">{tv(t, 'quickAnalysis.hivePlaceholder', 'Select a hive')}</option>
              {hivesForSelected.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.apiaryName ? `${h.label} · ${h.apiaryName}` : h.label}
                </option>
              ))}
            </select>
            {selectedApiaryId && hivesForSelected.length === 0 && (
              <p className="mt-2 text-xs text-neutral-400">
                {tv(
                  t,
                  'quickAnalysis.noHives',
                  'No hives found for this apiary yet. Try creating one from the apiary page.'
                )}
              </p>
            )}
          </div>

          {/* MEDIA */}
          <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5 text-sm">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {tv(t, 'quickAnalysis.mediaTitle', 'Photo input')}
            </p>

            <p className={`mt-2 text-xs ${hasMedia ? 'text-emerald-300' : 'text-neutral-500'}`}>
              {mediaSummary}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                className="h-11 w-full rounded-2xl"
                size="md"
                onClick={() => router.push('/apiaries/quick-analysis/capture')}
              >
                {tv(t, 'quickAnalysis.takePhoto', 'Take photo')}
              </Button>
              <Button
                className="h-11 w-full rounded-2xl"
                size="md"
                variant="ghost"
                onClick={() => router.push('/apiaries/quick-analysis/upload')}
              >
                {tv(t, 'quickAnalysis.upload', 'Upload')}
              </Button>
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              {tv(
                t,
                'quickAnalysis.mediaHint',
                'Capture or upload up to 5 images; they will be used in the deep analysis.'
              )}
            </p>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <Button
            className="mt-2 h-12 w-full rounded-2xl"
            size="lg"
            disabled={!selectedApiaryId || !selectedHiveId || !hasMedia}
            onClick={runAnalysis}
          >
            {tv(t, 'quickAnalysis.run', 'Run Full Analysis')}
          </Button>
        </div>
      )}
    </CardShell>
  );
}
