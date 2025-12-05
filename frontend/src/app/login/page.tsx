// frontend/src/app/login/page.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardShell from '@/components/shell/CardShell';
import LangToggle from '@/components/LangToggle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';

const tv = (t: (k: string) => string, k: string, fb: string) => (t(k) === k ? fb : t(k));

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setErr(null);

    if (!email || !password) {
      setErr(tv(t, 'common.genericError', 'Completa tus credenciales.'));
      return;
    }

    setLoading(true);
    try {
      // Router to home (apiaries) after login or signup
      router.replace('/apiaries');
    } catch {
      setErr(tv(t, 'auth.notAuthenticated', 'No pudimos iniciar sesión.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardShell
      heroSrc={null}
      headerLeft={
        <div className="flex items-center gap-2">
          <Image
            src="/icons/logo-honeyroute-amber-1024.png"
            width={34}
            height={34}
            alt="HoneyRoute"
            style={{ height: 'auto' }}
          />
          <span className="text-base font-semibold">HoneyRoute</span>
        </div>
      }
      headerRight={<LangToggle esLabel="ES" />}
    >
      <div className="mx-auto max-w-xs">
        <h1 className="text-3xl font-extrabold leading-tight text-center">
          {tv(t, 'login.title', 'Welcome')}
        </h1>
        <p className="mt-2 text-neutral-300 text-center">
          {tv(t, 'login.subtitle', 'Sign in to continue')}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            placeholder={tv(t, 'login.email', 'Email')}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder={tv(t, 'login.password', 'Password')}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <Button type="submit" size="lg" className="w-full rounded-2xl h-12" disabled={loading}>
            {loading ? '...' : tv(t, 'login.submit', 'Sign in')}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-neutral-500">
          <span className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs">{tv(t, 'login.or', 'or')}</span>
          <span className="h-px flex-1 bg-neutral-800" />
        </div>

        <p className="text-center text-amber-400 font-medium">
          <button
            className="underline-offset-4 hover:underline"
            onClick={() => {
              // Router to home (apiaries) after login or signup
              router.replace('/apiaries');
            }}
          >
            {tv(t, 'login.guest', 'Continue as guest')}
          </button>
        </p>

        <p className="mt-8 text-center text-xs text-neutral-500">
          <span className="text-neutral-400">{tv(t, 'common.poweredBy', 'Powered by')} </span>
          <span className="font-semibold tracking-wide">
            <span className="brand-outline brand-eco">Eco</span>
            <span className="brand-outline brand-ventus">Ventus</span>
          </span>
        </p>
      </div>
    </CardShell>
  );
}
