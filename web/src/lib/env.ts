/** True when a URL looks like a docs placeholder, not a real host. */
export function isConfiguredUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  const v = value.trim();
  if (!v || v === "#") return false;
  // Fake defaults from .env.example / early deploys
  if (/YOUR-|XXXX|placeholder|example\.com|linq\.app\/rejsy/i.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Valid sms: deep link to open Messages to the agent number. */
export function isConfiguredSms(value: string | undefined | null): value is string {
  if (!value) return false;
  const v = value.trim();
  if (!v.startsWith("sms:")) return false;
  if (/YOUR-|XXXX|\+45X{4,}/i.test(v)) return false;
  // Need a real number after sms: (E.164-ish digits)
  const rest = v.slice(4).split(/[?&]/)[0] ?? "";
  const digits = rest.replace(/\D/g, "");
  return digits.length >= 8;
}

/**
 * Desktop / button CTA: prefer Linq profile URL, else sms: to the agent.
 */
export function getCtaTarget(): string {
  const linq = process.env.NEXT_PUBLIC_LINQ_URL;
  if (isConfiguredUrl(linq)) return linq;
  const sms = process.env.NEXT_PUBLIC_IMESSAGE_HREF;
  if (isConfiguredSms(sms)) return sms;
  return "#";
}

/**
 * QR payload: must open the agent on iPhone → prefer sms: deep link.
 * Camera scan → Messages compose to Rejsy's Linq number.
 */
export function getQrTarget(): string {
  const sms = process.env.NEXT_PUBLIC_IMESSAGE_HREF;
  if (isConfiguredSms(sms)) return sms;
  const linq = process.env.NEXT_PUBLIC_LINQ_URL;
  if (isConfiguredUrl(linq)) return linq;
  return "";
}

/** @deprecated use getCtaTarget / getQrTarget */
export function getLinqTarget(): string {
  return getCtaTarget() === "#" ? "https://linq.app/rejsy" : getCtaTarget();
}
