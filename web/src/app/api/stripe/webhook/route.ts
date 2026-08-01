import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/checkout";

export const runtime = "nodejs";

async function sendPlusPing(userId: string) {
  // Wire to Person A/B Linq outbound when available.
  // For now log — Plus ping is the demo money-shot once Linq send is exported.
  console.log(
    "[stripe webhook] plus activated for",
    userId,
    "— send: you're on plus 🚆 plan away.",
  );

  const base = process.env.BACKEND_URL;
  if (!base) return;
  try {
    await fetch(`${base.replace(/\/$/, "")}/api/notify/plus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        message: "you're on plus 🚆 plan away.",
      }),
    });
  } catch (e) {
    console.error("plus ping failed", e);
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "webhook only runs where STRIPE_SECRET_KEY is set (Railway)" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "supabase missing" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    if (userId) {
      await supabase
        .from("users")
        .update({
          plan: "plus",
          stripe_customer_id: session.customer,
          subscription_status: "active",
        })
        .eq("id", userId);
      await sendPlusPing(userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    await supabase
      .from("users")
      .update({ plan: "free", subscription_status: "canceled" })
      .eq("stripe_customer_id", sub.customer);
  }

  return NextResponse.json({ received: true });
}
