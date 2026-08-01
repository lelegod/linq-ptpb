const NAME_KEY = "rejsy_onboarding_name";
const AGE_KEY = "rejsy_onboarding_age";

export const AGE_MIN = 13;
export const AGE_MAX = 120;

export function savePendingName(name: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(NAME_KEY, name.trim());
  } catch {
    /* ignore */
  }
}

export function readPendingName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export function clearPendingName() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(NAME_KEY);
  } catch {
    /* ignore */
  }
}

export function savePendingAge(age: number) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AGE_KEY, String(age));
  } catch {
    /* ignore */
  }
}

export function readPendingAge(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isInteger(n) ? n : null;
  } catch {
    return null;
  }
}

export function clearPendingAge() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AGE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearPendingOnboarding() {
  clearPendingName();
  clearPendingAge();
}

/** Parse and validate age as an integer in [AGE_MIN, AGE_MAX]. */
export function parseAge(
  input: string,
): { ok: true; age: number } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter your age." };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: "Age must be a whole number." };
  }
  const age = Number(trimmed);
  if (!Number.isInteger(age) || age < AGE_MIN || age > AGE_MAX) {
    return {
      ok: false,
      error: `Please enter an age between ${AGE_MIN} and ${AGE_MAX}.`,
    };
  }
  return { ok: true, age };
}

export type OnboardingMeta = {
  full_name?: string;
  name?: string;
  age?: number;
};

export function buildOnboardingMeta(
  name: string,
  age: number | null | undefined,
): OnboardingMeta {
  const trimmed = name.trim();
  const meta: OnboardingMeta = {};
  if (trimmed) {
    meta.full_name = trimmed;
    meta.name = trimmed;
  }
  if (typeof age === "number" && Number.isInteger(age)) {
    meta.age = age;
  }
  return meta;
}
