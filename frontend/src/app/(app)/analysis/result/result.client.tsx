'use client';

import { useEffect, useState } from 'react';
import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import BackBtn from '@/components/BackBtn';
import NavTab from '@/components/NavTab';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';
import { AnalysisStatusResponse, getAnalysis } from '@/lib/api';

function Pill({ text, tone }: { text: string; tone: 'low' | 'medium' | 'high' }) {
  const map = {
    low: 'bg-emerald-500/90 text-white',
    medium: 'bg-amber-400 text-black',
    high: 'bg-rose-500 text-white',
  } as const;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[tone]}`}>{text}</span>
  );
}

export default function ResultClient() {
  const { t } = useI18n();
  const [data, setData] = useState<AnalysisStatusResponse | null>(null);

  useEffect(() => {
    (async () => {
      const urlId = new URLSearchParams(location.search).get('jobId');
      if (urlId) {
        const s = await getAnalysis(urlId);
        setData(s);
      } else {
        const raw = sessionStorage.getItem('analysisResult');
        if (raw) setData(JSON.parse(raw));
      }
    })();
  }, []);

  const riskText =
    data?.riskLevel === 'high'
      ? (t('analysis.result.risk.high') ?? 'High')
      : data?.riskLevel === 'medium'
        ? (t('analysis.result.risk.medium') ?? 'Medium')
        : (t('analysis.result.risk.low') ?? 'Low');

  return (
    <CardShell
      headerLeft={
        <div className="flex items-center gap-2">
          <BackBtn />
          <BrandMark />
        </div>
      }
      headerRight={<LangToggle />}
      contentClassName="pb-24"
      footer={<NavTab active="home" />}
    >
      <h1 className="text-[22px] font-bold">{t('analysis.result.title') ?? 'Analysis Result'}</h1>

      <div className="mt-4 space-y-4">
        {/* Risk block */}
        <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-black/5">
          <p className="text-sm font-semibold">{t('analysis.result.riskTitle') ?? 'Risk Level'}</p>
          <div className="mt-2">
            <Pill text={riskText} tone={data?.riskLevel ?? 'low'} />
          </div>
        </div>

        {/* Detections */}
        <div className="rounded-2xl bg-neutral-900 p-2 ring-1 ring-black/5">
          <p className="px-2 pt-2 text-sm font-semibold">
            {t('analysis.result.detections') ?? 'Detections'}
          </p>
          <ul className="mt-2 space-y-2">
            {(data?.detections ?? []).map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-xl bg-neutral-800 px-3 py-3"
              >
                <span className="font-medium">{d.name}</span>
                <Pill
                  text={
                    d.severity === 'high'
                      ? (t('analysis.result.sev.high') ?? 'High')
                      : d.severity === 'medium'
                        ? (t('analysis.result.sev.medium') ?? 'Medium')
                        : (t('analysis.result.sev.low') ?? 'Low')
                  }
                  tone={d.severity}
                />
              </li>
            ))}
            {(data?.detections?.length ?? 0) === 0 && (
              <li className="px-3 py-3 text-sm text-neutral-400">
                {t('analysis.result.none') ?? 'No issues detected.'}
              </li>
            )}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => (window.location.href = `/analysis/recommendations${location.search}`)}
          >
            {t('analysis.result.seeRecs') ?? 'See recommendations'}
          </Button>
          <Button className="bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800">
            {t('analysis.result.logAction') ?? 'Log action'}
          </Button>
        </div>
      </div>
    </CardShell>
  );
}
