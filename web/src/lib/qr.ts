import QRCode from "qrcode";
import { getLinqTarget } from "@/lib/env";

export async function linqQrDataUrl(): Promise<string | null> {
  try {
    return await QRCode.toDataURL(getLinqTarget(), {
      margin: 1,
      width: 120,
      color: { dark: "#0B0B0C", light: "#00000000" },
      errorCorrectionLevel: "M",
    });
  } catch (e) {
    console.error("qr generate failed", e);
    return null;
  }
}
