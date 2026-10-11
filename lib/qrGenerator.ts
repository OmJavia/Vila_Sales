/**
 * Payment QR generation is deliberately disabled.
 *
 * The previous hand-written encoder failed independent QR decoding tests and
 * must not be used for payments. Replace this stub with a maintained QR library
 * and include automated payload-decoding tests before re-enabling payments.
 */
export function generateQrSvg(_text: string, _size = 240): string {
  throw new Error("QR generation is disabled: the previous encoder was not reliably scannable.");
}
