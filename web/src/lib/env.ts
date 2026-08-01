const DEFAULT_BODY = "hi%20rejsy";

/** True when a URL looks like a docs placeholder, not a real host. */
export function isConfiguredUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  const v = value.trim();
  if (!v || v === "#") return false;
  if (/YOUR-|XXXX|placeholder|example\.com|linq\.app\/rejsy/i.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Valid sms: deep link with a real-looking number (opens Messages). */
export function isConfiguredSms(value: string | undefined | null): value is string {
  if (!value) return false;
  const v = value.trim();
  if (!v.startsWith("sms:")) return false;
  if (/YOUR-|XXXX|\+45X{4,}/i.test(v)) return false;
  const rest = v.slice(4).split(/[?&]/)[0] ?? "";
  const digits = rest.replace(/\D/g, "");
  return digits.length >= 8;
}

/** Build sms:+E164&body=… from a bare phone or full sms: href. */
export function buildMessagesHref(raw?: string | null): string {
  const fallback = `sms:+4520000000&body=${DEFAULT_BODY}`;
  if (!raw?.trim()) return fallback;

  const v = raw.trim();
  if (v.startsWith("sms:")) {
    if (isConfiguredSms(v)) {
      // Ensure body is present for the demo opener
      if (/[?&]body=/i.test(v)) return v;
      const sep = v.includes("?") ? "&" : "&";
      return `${v}${sep}body=${DEFAULT_BODY}`;
    }
    return fallback;
  }

  // Bare E.164 / national digits
  const digits = v.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length >= 8) {
    const e164 = digits.startsWith("+") ? digits : `+${digits}`;
    return `sms:${e164}&body=${DEFAULT_BODY}`;
  }
  return fallback;
}

/**
 * Always returns an sms: link that opens Messages (iPhone) / Messages.app (Mac).
 * Prefers NEXT_PUBLIC_IMESSAGE_HREF, then NEXT_PUBLIC_LINQ_FROM_NUMBER / LINQ_FROM_NUMBER.
 */
export function getMessagesHref(): string {
  return buildMessagesHref(
    process.env.NEXT_PUBLIC_IMESSAGE_HREF ||
      process.env.NEXT_PUBLIC_LINQ_FROM_NUMBER ||
      process.env.LINQ_FROM_NUMBER,
  );
}

/** QR encodes the same Messages deep link as the mobile button. */
export function getQrTarget(): string {
  return getMessagesHref();
}

/** Desktop optional profile link — not used for the primary Messages CTA. */
export function getCtaTarget(): string {
  return getMessagesHref();
}
