import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Supabase redirects magic-link / OAuth here with ?code=.
 * Exchange the code for a session (cookie) then redirect to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") || "/dashboard";
  const nextPath = nextRaw.startsWith("/") ? nextRaw : "/dashboard";
  const errorDescription =
    url.searchParams.get("error_description") ||
    url.searchParams.get("error");

  if (errorDescription) {
    const fail = new URL("/login", url.origin);
    fail.searchParams.set("error", errorDescription);
    fail.searchParams.set("next", nextPath);
    return NextResponse.redirect(fail);
  }

  if (code) {
    const supabase = await getSupabaseServer();
    if (!supabase) {
      const fail = new URL("/login", url.origin);
      fail.searchParams.set("error", "auth_config");
      fail.searchParams.set("next", nextPath);
      return NextResponse.redirect(fail);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(nextPath, url.origin));
    }

    const fail = new URL("/login", url.origin);
    fail.searchParams.set("error", error.message);
    fail.searchParams.set("next", nextPath);
    return NextResponse.redirect(fail);
  }

  // No code — send the user onward (or to login).
  return NextResponse.redirect(new URL(nextPath, url.origin));
}
