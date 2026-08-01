import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { resolveUpgradeToken } from "@/lib/stripe/resolveUpgradeToken";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "");
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  // Vercel proxy path — no Stripe secrets on Vercel
  if (!process.env.STRIPE_SECRET_KEY && process.env.BACKEND_URL) {
    const res = await fetch(
      `${process.env.BACKEND_URL.replace(/\/$/, "")}/api/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      },
    );
    const data = await res.json().catch(() => ({ error: "backend error" }));
    return NextResponse.json(data, { status: res.status });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "checkout not configured (set STRIPE_SECRET_KEY or BACKEND_URL)" },
      { status: 503 },
    );
  }

  let resolved;
  try {
    resolved = await resolveUpgradeToken(token);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "token resolve failed" }, { status: 500 });
  }
  if (!resolved) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }

  const appOrigin =
    process.env.PUBLIC_APP_URL ??
    req.headers.get("origin") ??
    "http://localhost:3000";

  try {
    const session = await createCheckoutSession({
      userId: resolved.userId,
      token,
      appOrigin,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "checkout failed" }, { status: 500 });
  }
}
