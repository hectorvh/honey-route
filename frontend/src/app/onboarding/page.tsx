// frontend/src/app/(solo)/onboarding/page.tsx
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
    <Image src="/images/wifi-off.png" alt="" width={16} height={16} className="mr-1 inline-block" />
  );
}

export default function Onboarding() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <CardShell
      showHeader={false}
      // sangra a los bordes: quita el padding de <main> y compensa el pt-6
      heroClassName="mx-[-1.5rem] -mt-6 h-56 overflow-hidden rounded-t-3xl sm:h-64"
      heroSlot={
        <>
          <Image
            src="/images/onboarding2.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 420px) 100vw, 420px"
          />
          {/* degradado más fuerte como el mock, empezando transparente arriba */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-neutral-950" />
          <div className="absolute top-2 right-2">
            <LangToggle />
          </div>
        </>
      }
      contentClassName="pt-6 pb-8" // deja el padding del contenido
    >
      <h1 className="text-[32px] leading-tight font-extrabold text-center">
        {t('onboarding.title1')}
        <br />
        {t('onboarding.title2')}
      </h1>

      <p className="mt-2 text-neutral-300 text-center">{t('onboarding.subtitle')}</p>

      <div className="mt-5 flex justify-center">
        <Badge className="bg-transparent text-amber-400 ring-1 ring-white/10">
          <WifiOff /> {t('onboarding.offline')}
        </Badge>
      </div>

      <div className="mt-10">
        <Button
          variant="primary"
          size="lg"
          className="h-14 w-full rounded-full text-lg font-semibold"
          onClick={() => router.push('/login')}
        >
          {t('onboarding.cta')}
        </Button>

        <p className="mt-3 text-center text-xs text-neutral-400">
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
