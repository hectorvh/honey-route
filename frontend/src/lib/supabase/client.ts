import { createBrowserClient } from '@supabase/ssr';

export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) throw new Error('SUPABASE env missing');

  // Sin cookies personalizadas en browser; deja los defaults
  return createBrowserClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
