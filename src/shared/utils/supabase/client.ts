import { createBrowserClient } from "@supabase/ssr";

// Share auth cookies across admin + public subdomains
const ADMIN_DOMAIN = process.env.ADMIN_DOMAIN;
const cookieDomain = ADMIN_DOMAIN
  ? `.${ADMIN_DOMAIN.replace(/^app\./, "")}`
  : undefined;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    ...(cookieDomain ? { cookieOptions: { domain: cookieDomain } } : {}),
  });
}
