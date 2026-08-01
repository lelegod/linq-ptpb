import QRCode from "qrcode";
import { getQrTarget } from "@/lib/env";

export async function linqQrDataUrl(): Promise<string> {
  const target = getQrTarget();
  // Opaque light color — transparent QR often fails Camera scan
  return QRCode.toDataURL(target, {
    margin: 2,
    width: 180,
    color: { dark: "#0B0B0C", light: "#FDFBF7" },
    errorCorrectionLevel: "M",
  });
}
