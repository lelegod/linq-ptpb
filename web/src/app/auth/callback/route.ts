import { NextResponse } from "next/server";

/**
 * Supabase redirects magic-link / OAuth here with ?code=.
 * Forward to /login so the browser client can exchange the code into a session
 * (no SSR cookie jar required).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL("/login", url.origin);
  url.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  if (!target.searchParams.has("next")) {
    target.searchParams.set("next", "/login");
  }
  return NextResponse.redirect(target);
}
