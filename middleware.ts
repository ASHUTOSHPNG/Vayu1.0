import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        req.cookies.set(name, value)
                    );
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const CRON_ROUTES = ['/api/cron/'];
    const ADMIN_ROUTES = ['/dashboard'];
    const AUTH_ROUTES = ['/login', '/register'];

    const path = req.nextUrl.pathname;

    // Protect cron routes with secret
    if (CRON_ROUTES.some(r => path.startsWith(r))) {
        const authHeader = req.headers.get('authorization');
        const expected = `Bearer ${process.env.CRON_SECRET}`;
        if (authHeader !== expected) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return res;
    }

    // IMPORTANT: Use getUser() for security in middleware
    const { data: { user } } = await supabase.auth.getUser();

    // Protect admin dashboard routes
    if (ADMIN_ROUTES.some(r => path.startsWith(r))) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        // Verify admin role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('admin_type, is_active')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.admin_type || !profile.is_active) {
            await supabase.auth.signOut();
            const url = new URL('/login', req.url);
            url.searchParams.set('message', 'access_denied');
            return NextResponse.redirect(url);
        }
        return res;
    }

    // Redirect logged-in admins away from auth pages
    if (AUTH_ROUTES.some(r => path.startsWith(r))) {
        if (user) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return res;
    }

    return res;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register',
        '/api/cron/:path*',
    ],
};

