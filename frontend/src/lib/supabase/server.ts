// frontend/src/lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/** Detecta Promises sin usar `any` */
function isThenable<T>(v: unknown): v is Promise<T> {
  return typeof (v as { then?: unknown }).then === 'function';
}

/** Tipo deducido de cookies(); funciona si es sync o promise */
type CookiesResolved = Awaited<ReturnType<typeof cookies>>;

/** En algunos entornos cookies() permite set(); en otros es solo lectura */
type MaybeWritableCookies = CookiesResolved & {
  set?: (name: string, value: string, options: CookieOptions) => void;
};

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) throw new Error('SUPABASE env missing');

  const raw = cookies() as unknown;
  const store: MaybeWritableCookies = isThenable<CookiesResolved>(raw)
    ? ((await raw) as MaybeWritableCookies)
    : (raw as MaybeWritableCookies);

  return createServerClient(url, anon, {
    cookies: {
      get(name: string): string | undefined {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions): void {
        store.set?.(name, value, options);
      },
      remove(name: string, options: CookieOptions): void {
        store.set?.(name, '', { ...options, maxAge: 0 });
      },
    },
  });
}

/** Alias para compatibilidad con código que use `supabaseServer()` */
export const supabaseServer = createClient;
