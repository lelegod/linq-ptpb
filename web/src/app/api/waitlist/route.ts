import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AGE_MAX, AGE_MIN, parseAge } from "@/lib/auth/onboarding";
import { getSupabaseEnv } from "@/lib/supabase/env";

type Body = {
  name?: unknown;
  age?: unknown;
  email?: unknown;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email : "";
  const email = normalizeEmail(emailRaw);
  const ageInput =
    typeof body.age === "number"
      ? String(body.age)
      : typeof body.age === "string"
        ? body.age
        : "";

  if (!name || name.length > 120) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 },
    );
  }

  const parsedAge = parseAge(ageInput);
  if (!parsedAge.ok) {
    return NextResponse.json({ error: parsedAge.error }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const payload = {
    name,
    age: parsedAge.age,
    email,
  };

  // Always log so Vercel function logs capture signups even if DB isn't ready.
  console.info("[waitlist]", JSON.stringify(payload));

  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) {
    return NextResponse.json({
      ok: true,
      stored: "log",
      message: "You're on the list.",
    });
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("waitlist").insert(payload);

  if (!error) {
    return NextResponse.json({
      ok: true,
      stored: "supabase",
      message: "You're on the list.",
    });
  }

  // Unique email → treat as already joined (success).
  if (error.code === "23505") {
    return NextResponse.json({
      ok: true,
      stored: "supabase",
      duplicate: true,
      message: "You're already on the list.",
    });
  }

  // Table missing / schema cache — succeed with log fallback so UX isn't blocked.
  const missingTable =
    error.code === "PGRST205" ||
    /could not find the table/i.test(error.message) ||
    /schema cache/i.test(error.message);

  if (missingTable) {
    console.warn(
      "[waitlist] table missing — run supabase/migrations/002_waitlist.sql",
      error.message,
    );
    return NextResponse.json({
      ok: true,
      stored: "log",
      message: "You're on the list.",
      setup:
        "Apply supabase/migrations/002_waitlist.sql in the Supabase SQL editor for durable storage.",
    });
  }

  // RLS / other errors
  console.error("[waitlist] insert failed", error);
  return NextResponse.json(
    {
      error:
        error.message ||
        `Could not save your spot. Age must be ${AGE_MIN}–${AGE_MAX}.`,
    },
    { status: 500 },
  );
}
