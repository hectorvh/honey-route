// frontend/src/app/(app)/capture/CaptureClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import CardShell from '@/components/shell/CardShell';
import BrandMark from '@/components/BrandMark';
import LangToggle from '@/components/LangToggle';
import NavTab from '@/components/NavTab';
import BackBtn from '@/components/BackBtn';
import { useI18n } from '@/i18n/I18nProvider';

type Facing = 'environment' | 'user';

interface NavigatorWithWebkit extends Navigator {
  webkitGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: DOMException) => void
  ) => void;
}

function tx(t: (k: string) => string, key: string, fallback: string) {
  const v = t(key);
  return v === key ? fallback : v;
}
function isSecureOrigin() {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname } = window.location;
  return protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
}
async function getUserMediaCompat(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (navigator.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }
  const nav = navigator as NavigatorWithWebkit;
  if (nav.webkitGetUserMedia) {
    return new Promise<MediaStream>((resolve, reject) => {
      nav.webkitGetUserMedia!(constraints, resolve, (err) => reject(err));
    });
  }
  throw new DOMException('Camera API not available', 'NotSupportedError');
}
function extractErrorInfo(e: unknown): { name?: string; message?: string } {
  if (e instanceof DOMException || e instanceof Error) {
    return { name: e.name, message: e.message };
  }
  if (typeof e === 'object' && e !== null) {
    const rec = e as Record<string, unknown>;
    const name = typeof rec.name === 'string' ? rec.name : undefined;
    const message = typeof rec.message === 'string' ? rec.message : undefined;
    return { name, message };
  }
  return {};
}

/** Botón solo con ícono (blanco), sin texto visible */
function IconBtn(props: {
  src: string;
  label: string; // aria-label
  onClick: () => void;
  disabled?: boolean;
}) {
  const { src, label, onClick, disabled } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-900 ring-1 ring-black/5 hover:bg-neutral-800 disabled:opacity-50"
    >
      {/* blanco forzado */}
      <Image src={src} alt="" width={22} height={22} className="invert" />
    </button>
  );
}

export default function CaptureClient() {
  const { t } = useI18n();
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facing, setFacing] = useState<Facing>('environment');
  const [shotURL, setShotURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void startStream(facing);
    return stopStream;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing]);

  useEffect(() => {
    return () => {
      stopStream();
      if (shotURL) URL.revokeObjectURL(shotURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startStream(nextFacing: Facing) {
    try {
      stopStream();

      if (!isSecureOrigin()) {
        setError(tx(t, 'camera.errors.insecure', 'Camera requires HTTPS (use cloudflared link).'));
        return;
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await getUserMediaCompat(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play().catch(() => {});

      setError(null);
    } catch (e: unknown) {
      const { name, message } = extractErrorInfo(e);
      if (name === 'NotSupportedError') {
        setError(tx(t, 'camera.errors.noApi', 'Camera API not available on this device.'));
      } else if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError(tx(t, 'camera.errors.denied', 'Permission denied. Check browser settings.'));
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError(tx(t, 'camera.errors.notFound', 'No camera found.'));
      } else {
        setError(
          tx(t, 'camera.errors.generic', 'Error starting camera') + (message ? `: ${message}` : '')
        );
      }
    }
  }

  function stopStream() {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  }

  function switchCamera() {
    setFacing((f) => (f === 'environment' ? 'user' : 'environment'));
  }

  function capture() {
    const video = videoRef.current;
    const c = canvasRef.current;
    if (!video || !c) return;

    const w = video.videoWidth || 1080;
    const h = video.videoHeight || 1440;
    c.width = w;
    c.height = h;

    const ctx = c.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    c.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setShotURL(url);
        try {
          const dataURL = c.toDataURL('image/jpeg', 0.9);
          sessionStorage.setItem('lastCaptureDataURL', dataURL);
        } catch {}
      },
      'image/jpeg',
      0.9
    );
  }

  function retake() {
    if (shotURL) URL.revokeObjectURL(shotURL);
    setShotURL(null);
    void startStream(facing);
  }

  function goAnalyze() {
    if (shotURL) {
      try {
        const payload = { images: [shotURL], video: null as string | null };
        sessionStorage.setItem('analysisPayload', JSON.stringify(payload));
      } catch {}
    }
    router.push('/analysis');
  }

  function openUploadScreen() {
    router.push('/analysis/upload');
  }

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
      <h1 className="text-[22px] font-bold">{tx(t, 'home.capture', 'Capture / Analyze')}</h1>

      <div className="mt-4">
        {/* Visor */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-black/5">
          {!shotURL && (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {shotURL && (
            <Image
              src={shotURL}
              alt="Captured"
              fill
              className="object-cover"
              sizes="(max-width: 420px) 100vw, 420px"
              unoptimized
            />
          )}

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-52 w-40 rounded-xl border-2 border-amber-400/70 [border-style:dashed]" />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

        {/* Controles centrados (solo íconos blancos) */}
        {!shotURL ? (
          <div className="mt-5 flex items-center justify-center gap-5">
            <IconBtn
              src="/images/flip.png"
              label={tx(t, 'camera.flip', 'Flip')}
              onClick={switchCamera}
            />

            {/* Shutter central */}
            <button
              type="button"
              onClick={capture}
              className="grid h-16 w-16 place-items-center rounded-full border-4 border-white/40 bg-amber-400 text-black shadow-lg hover:bg-amber-300"
              aria-label={tx(t, 'camera.capture', 'Capture')}
            >
              <Image src="/images/camera.png" alt="" width={22} height={22} />
            </button>

            {/* OJO: tu archivo es galery.png */}
            <IconBtn
              src="/images/gallery.png"
              label={tx(t, 'analysis.upload.title', 'Add Images')}
              onClick={openUploadScreen}
            />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={retake}
              className="h-12 rounded-2xl bg-neutral-900 text-white ring-1 ring-black/5 hover:bg-neutral-800"
            >
              {tx(t, 'camera.retake', 'Retake')}
            </button>
            <button
              type="button"
              onClick={goAnalyze}
              className="h-12 rounded-2xl bg-amber-400 font-semibold text-black hover:bg-amber-300"
            >
              {tx(t, 'camera.analyze', 'Analyze')}
            </button>
          </div>
        )}

        {/* Tip box */}
        <div className="mt-5 rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-300 ring-1 ring-black/5">
          <p className="mb-2 font-semibold">{tx(t, 'camera.tipsTitle', 'Tips for best results')}</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>{tx(t, 'camera.tips.light', 'Good natural/LED light (avoid harsh shadows).')}</li>
            <li>{tx(t, 'camera.tips.top', 'Top-down shot, hive centered in the frame.')}</li>
            <li>{tx(t, 'camera.tips.steady', 'Hold steady 2–3s before capturing.')}</li>
            <li>{tx(t, 'camera.tips.fill', 'Fill the frame with comb/frames.')}</li>
          </ul>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </CardShell>
  );
}
