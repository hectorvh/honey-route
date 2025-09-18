// No usar Supabase. Simplemente redirige a /login.
// Evita prerender y evita que falle en build.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = '/login';
  // Anota que es “local” (opcional)
  if (!url.searchParams.has('provider')) url.searchParams.set('provider', 'local');
  return Response.redirect(url, 302);
}

export async function POST(request: Request) {
  return GET(request);
}
