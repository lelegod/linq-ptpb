import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
}

export async function createCheckoutSession(opts: {
  userId: string;
  token: string;
  appOrigin: string;
}) {
  const stripe = getStripe();
  const price = process.env.STRIPE_PRICE_ID;
  if (!price) throw new Error("STRIPE_PRICE_ID missing");

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: opts.userId,
    success_url: `${opts.appOrigin}/upgrade/done`,
    cancel_url: `${opts.appOrigin}/upgrade?u=${encodeURIComponent(opts.token)}`,
  });
}
