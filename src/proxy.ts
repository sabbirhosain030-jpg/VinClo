import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mdzylkxbvlgkmmlapwxe.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kenlsa3hidmxna21tbGFwd3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjU4NzUsImV4cCI6MjA5MDY0MTg3NX0.IF8ZhY2oP-PmKaWll3-bpVQ4ILNEabmuommuasTTckY',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect /pos — redirect to /login if not authenticated
  if (pathname.startsWith('/pos') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and hitting /login, send to /pos
  if (pathname === '/login' && user) {
    const posUrl = request.nextUrl.clone();
    posUrl.pathname = '/pos';
    return NextResponse.redirect(posUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/pos/:path*', '/login'],
};
