'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardShell from '@/components/shell/CardShell';
import LangToggle from '@/components/LangToggle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) return setErr('Completa tus credenciales.');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      router.push('/hives');
    } catch {
      setErr('No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardShell
      heroSrc={null} /* SIN imagen */
      headerLeft={
        <div className="flex items-center gap-2">
          <Image
            src="/images/miel.png"
            alt="HoneyRoute logo"
            width={20}
            height={20}
            className="rounded-sm"
          />
          <span className="text-base font-semibold">HoneyRoute</span>
        </div>
      }
      headerRight={<LangToggle esLabel="ES" />}
    >
      <div className="mx-auto max-w-xs">
        <h1 className="text-3xl font-extrabold leading-tight text-center">{t('login.title')}</h1>
        <p className="mt-2 text-neutral-300 text-center">{t('login.subtitle')}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            placeholder={t('login.email')}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder={t('login.password')}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <Button type="submit" size="lg" className="w-full rounded-2xl h-12" disabled={loading}>
            {loading ? '...' : t('login.submit')}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-neutral-500">
          <span className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs">{t('login.or')}</span>
          <span className="h-px flex-1 bg-neutral-800" />
        </div>

        <p className="text-center text-amber-400 font-medium">
          <button
            className="underline-offset-4 hover:underline"
            onClick={() => router.push('/hives')}
          >
            {t('login.guest')}
          </button>
        </p>

        <p className="mt-8 text-center text-xs text-neutral-500">
          <span className="text-neutral-400">{t('common.poweredBy')} </span>
          <span className="font-semibold tracking-wide">
            <span className="brand-outline brand-eco">Eco</span>
            <span className="brand-outline brand-ventus">Ventus</span>
          </span>
        </p>
      </div>
    </CardShell>
  );
}
