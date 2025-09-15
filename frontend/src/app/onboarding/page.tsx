'use client';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CardShell from '@/components/shell/CardShell';
import LangToggle from '@/components/LangToggle';
import { useI18n } from '@/i18n/I18nProvider';
import { useRouter } from 'next/navigation';

function WifiOff() {
  return (
    <Image
      src="/images/wifi-off.png"
      alt="WiFi off"
      width={16}
      height={16}
      className="mr-1 inline-block"
    />
  );
}

export default function Onboarding() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <CardShell
      showHeader={false} // ← SIN header para que la imagen toque el borde superior
      heroSlot={
        <div className="relative h-80">
          <Image
            src="/images/onboarding.jpg"
            alt="Bee and flowers"
            fill
            className="object-cover"
            priority
          />
          {/* Degradado negro para contraste del título */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-neutral-950" />
          {/* Toggle flotante arriba a la derecha */}
          <div className="absolute top-3 right-3">
            <LangToggle />
          </div>
        </div>
      }
    >
      <h1 className="text-3xl font-extrabold leading-tight text-center">
        {t('onboarding.title1')}
        <br />
        {t('onboarding.title2')}
      </h1>
      <p className="mt-2 text-neutral-300 text-center">{t('onboarding.subtitle')}</p>

      {/* Badge centrado y amarillo */}
      <div className="mt-5 flex justify-center">
        <Badge className="text-amber-400">
          <WifiOff />
          {t('onboarding.offline')}
        </Badge>
      </div>

      <div className="mt-10">
        <Button
          variant="primary"
          size="lg"
          className="h-14 w-full rounded-full"
          onClick={() => router.push('/login')}
        >
          {t('onboarding.cta')}
        </Button>

        {/* Eco / Ventus con colores y contorno */}
        <p className="mt-4 text-center text-xs text-neutral-400">
          {t('onboarding.poweredPrefix')}{' '}
          <span className="font-semibold">
            <span className="brand-outline brand-eco">Eco</span>
            <span className="brand-outline brand-ventus">Ventus</span>
          </span>
        </p>
      </div>
    </CardShell>
  );
}
