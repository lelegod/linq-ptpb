/** True when a URL looks like a docs placeholder, not a real host. */
export function isConfiguredUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  const v = value.trim();
  if (!v || v === "#") return false;
  if (/YOUR-|XXXX|placeholder|example\.com/i.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function getLinqTarget(): string {
  const linq = process.env.NEXT_PUBLIC_LINQ_URL;
  if (isConfiguredUrl(linq)) return linq;
  const sms = process.env.NEXT_PUBLIC_IMESSAGE_HREF;
  if (sms && sms.startsWith("sms:")) return sms;
  return "https://linq.app/rejsy";
}
