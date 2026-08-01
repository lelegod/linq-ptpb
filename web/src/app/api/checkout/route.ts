import { NextRequest, NextResponse } from "next/server";
import { isConfiguredUrl } from "@/lib/env";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { resolveUpgradeToken } from "@/lib/stripe/resolveUpgradeToken";

const NOT_CONFIGURED =
  "Checkout isn’t wired yet — Stripe runs on Railway. Text rejsy for an unlock link, or try again once the team sets BACKEND_URL / STRIPE_*.";

export async function POST(req: NextRequest) {
  let body: { token?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const token = String(body.token ?? "").trim();
  if (!token) {
    return NextResponse.json(
      { error: "Missing unlock token. Open the link from iMessage (?u=…)." },
      { status: 400 },
    );
  }

  // Vercel proxy path — no Stripe secrets on Vercel
  if (!process.env.STRIPE_SECRET_KEY && isConfiguredUrl(process.env.BACKEND_URL)) {
    try {
      const res = await fetch(
        `${process.env.BACKEND_URL!.replace(/\/$/, "")}/api/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ token }),
        },
      );
      const data = await res.json().catch(() => ({
        error: "Backend returned a non-JSON response.",
      }));
      return NextResponse.json(data, { status: res.status });
    } catch (e) {
      console.error("checkout proxy failed", e);
      return NextResponse.json(
        { error: "Couldn’t reach the Railway checkout API. Is BACKEND_URL up?" },
        { status: 502 },
      );
    }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 503 });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: "Supabase isn’t configured for token resolve yet." },
      { status: 503 },
    );
  }

  let resolved;
  try {
    resolved = await resolveUpgradeToken(token);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Couldn’t resolve unlock token. Check Supabase / magic_tokens." },
      { status: 500 },
    );
  }
  if (!resolved) {
    return NextResponse.json(
      { error: "This unlock link is invalid or expired. Text rejsy for a new one." },
      { status: 400 },
    );
  }

  const appOrigin =
    (isConfiguredUrl(process.env.PUBLIC_APP_URL)
      ? process.env.PUBLIC_APP_URL
      : null) ??
    req.headers.get("origin") ??
    "http://localhost:3000";

  try {
    const session = await createCheckoutSession({
      userId: resolved.userId,
      token,
      appOrigin,
    });
    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Stripe checkout failed. Check STRIPE_SECRET_KEY / STRIPE_PRICE_ID." },
      { status: 500 },
    );
  }
}
