import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const ADMIN_DOMAIN = process.env.ADMIN_DOMAIN;
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Subdomain routing: youngcho.billionsoulharvest.org → /young-cho
  if (host.startsWith("youngcho.")) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/young-cho";
      return NextResponse.rewrite(url);
    }
    // Block all other routes on this subdomain
    if (!pathname.startsWith("/young-cho") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      const url = request.nextUrl.clone();
      url.pathname = "/young-cho";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next({ request });
  }

  // Domain-based routing (skipped when ADMIN_DOMAIN is not set, e.g. local dev)
  if (ADMIN_DOMAIN) {
    const isAdminDomain = host === ADMIN_DOMAIN;
    const publicDomain = host.replace(/^app\./, "www.");

    if (isAdminDomain) {
      // Admin domain: redirect / to dashboard, block public-only routes
      if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }
      if (
        !pathname.startsWith("/admin") &&
        !pathname.startsWith("/login") &&
        !pathname.startsWith("/api")
      ) {
        // Redirect public routes to public domain
        const url = request.nextUrl.clone();
        url.host = publicDomain;
        url.port = "";
        return NextResponse.redirect(url);
      }
    } else {
      // Public domain: block admin routes
      if (pathname.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.host = ADMIN_DOMAIN;
        url.port = "";
        return NextResponse.redirect(url);
      }
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  // Share auth cookies across admin + public subdomains
  const cookieDomain = ADMIN_DOMAIN
    ? `.${ADMIN_DOMAIN.replace(/^app\./, "")}`
    : undefined;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            supabaseResponse.cookies.set(name, value, {
              ...options,
              ...(cookieDomain ? { domain: cookieDomain } : {}),
            })
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Rewrite public page routes to the static site route group
  const isPublicPageRoute =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/static-render") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/young-cho");

  if (isPublicPageRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/static-render${pathname}`;
    const rewriteResponse = NextResponse.rewrite(url, { request });
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return rewriteResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
