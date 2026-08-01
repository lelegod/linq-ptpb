import {
  maskPhone,
  resolveUpgradeToken,
} from "@/lib/stripe/resolveUpgradeToken";
import { UpgradeClient } from "./UpgradeClient";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u } = await searchParams;
  const token = u?.trim() || null;

  let maskedPhone: string | null = null;
  if (token && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      const resolved = await resolveUpgradeToken(token);
      maskedPhone = maskPhone(resolved?.phone);
    } catch {
      // show generic Plus card if resolve fails
    }
  }

  return <UpgradeClient token={token} maskedPhone={maskedPhone} />;
}
