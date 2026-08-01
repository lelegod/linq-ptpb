const KEY = "rejsy_onboarding_name";

export function savePendingName(name: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, name.trim());
  } catch {
    /* ignore */
  }
}

export function readPendingName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPendingName() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
