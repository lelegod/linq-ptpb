import { NextResponse } from "next/server";

/**
 * Supabase redirects magic-link / OAuth here with ?code=.
 * Forward to `next` (default /dashboard) so the browser client can exchange
 * the code into a session.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextRaw = url.searchParams.get("next") || "/dashboard";
  const nextPath = nextRaw.startsWith("/") ? nextRaw : "/dashboard";
  const target = new URL(nextPath, url.origin);

  url.searchParams.forEach((value, key) => {
    if (key === "next") return;
    target.searchParams.set(key, value);
  });

  return NextResponse.redirect(target);
}
