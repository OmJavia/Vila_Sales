/**
 * Vila Sales — Standard QR Code Matrix & SVG Generator
 * Generates genuine, scannable QR Codes (ISO/IEC 18004) for Indian UPI Payment URIs
 * powered by the industry-standard qrcode engine.
 */

import QRCode from "qrcode";
// @ts-ignore
import svgRenderer from "qrcode/lib/renderer/svg";

/**
 * Generates an ISO/IEC 18004 compliant SVG QR code string synchronously.
 * Decodable by all standard mobile banking apps (GPay, PhonePe, Paytm, BHIM)
 * and optical decoders (jsQR, zbar, ZXing).
 */
export function generateQrSvg(text: string, size = 240): string {
  try {
    const qr = QRCode.create(text, {
      errorCorrectionLevel: "M",
    });
    const svg: string = svgRenderer.render(qr, {
      margin: 2,
      width: size,
    });
    return svg;
  } catch (error) {
    console.error("QR Code generation error:", error);
    // Return empty fallback SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#FFFFFF"/></svg>`;
  }
}
