'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LangToggle from '@/components/LangToggle';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

function WifiOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M1 1l22 22" />
      <path d="M16.72 11.06a10.94 10.94 0 0 0-9.44 0" />
      <path d="M3.51 6.5a16 16 0 0 1 16.98 0" />
      <path d="M12 20h.01" />
      <path d="M8.53 15.11a6 6 0 0 1 6.95 0" />
    </svg>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="min-h-dvh bg-neutral-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-2xl">
        {/* Hero */}
        <div className="relative h-80">
          <Image
            src="/images/onboarding-hero.jpg"
            alt="Bee and flowers"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-neutral-950" />
          <div className="absolute top-3 right-3">
            <LangToggle />
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 pb-8 pt-6">
          <h1 className="text-3xl font-extrabold leading-tight text-center">
            {t('onboarding.title1')}
            <br />
            {t('onboarding.title2')}
          </h1>
          <p className="mt-2 text-neutral-300 text-center">{t('onboarding.subtitle')}</p>

          {/* Badge centrado y amarillo (icono + texto) */}
          <div className="mt-5 flex justify-center">
            <Badge className="text-amber-400">
              <WifiOffIcon />
              {t('onboarding.offline')}
            </Badge>
          </div>

          <div className="mt-10">
            <Button
              variant="primary"
              size="lg"
              className="h-14 w-full rounded-full"
              onClick={() => router.push('/hives')}
            >
              {t('onboarding.cta')}
            </Button>

            {/* Eco / Ventus con 2 colores */}
            <p className="mt-4 text-center text-xs text-neutral-400">
              {t('onboarding.poweredPrefix')}{' '}
              <span className="font-semibold">
                <span className="brand-outline brand-eco">Eco</span>
                <span className="brand-outline brand-ventus">Ventus</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
