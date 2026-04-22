export const EXTENSION_PAYMENT_INTENT_KEY = "swiftera:extension-payment-intent";

export interface ExtensionPaymentIntent {
  rentalOrderId: string;
  additionalRentalDays: number;
  txnRef: string;
  createdAt: number;
}

export function saveExtensionPaymentIntent(intent: ExtensionPaymentIntent) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    EXTENSION_PAYMENT_INTENT_KEY,
    JSON.stringify(intent),
  );
}

export function readExtensionPaymentIntent(): ExtensionPaymentIntent | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(EXTENSION_PAYMENT_INTENT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ExtensionPaymentIntent>;

    if (
      !parsed ||
      typeof parsed.rentalOrderId !== "string" ||
      !parsed.rentalOrderId ||
      typeof parsed.additionalRentalDays !== "number" ||
      parsed.additionalRentalDays < 1 ||
      typeof parsed.txnRef !== "string" ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }

    return {
      rentalOrderId: parsed.rentalOrderId,
      additionalRentalDays: parsed.additionalRentalDays,
      txnRef: parsed.txnRef,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export function clearExtensionPaymentIntent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(EXTENSION_PAYMENT_INTENT_KEY);
}

export function extractTxnRefFromPaymentUrl(paymentUrl: string): string {
  try {
    const url = new URL(paymentUrl);
    return url.searchParams.get("vnp_TxnRef") ?? "";
  } catch {
    return "";
  }
}
