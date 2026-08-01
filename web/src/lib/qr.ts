import QRCode from "qrcode";
import { getQrTarget } from "@/lib/env";

export async function linqQrDataUrl(): Promise<string | null> {
  const target = getQrTarget();
  if (!target) {
    console.warn(
      "QR skipped: set NEXT_PUBLIC_IMESSAGE_HREF=sms:+45…&body=hi%20rejsy (real Linq number)",
    );
    return null;
  }
  try {
    // Opaque light color — transparent QR often fails Camera scan
    return await QRCode.toDataURL(target, {
      margin: 2,
      width: 160,
      color: { dark: "#0B0B0C", light: "#FDFBF7" },
      errorCorrectionLevel: "M",
    });
  } catch (e) {
    console.error("qr generate failed", e);
    return null;
  }
}
