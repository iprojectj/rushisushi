// InfinitePay Checkout Integrado (server-only). Hosted checkout link: the
// customer pays on InfinitePay's page and returns to /obrigado.html.
export const INFINITEPAY_API_BASE_URL = "https://api.checkout.infinitepay.io";

export function getInfinitePayHeaders(): Record<string, string> {
  const key = process.env.INFINITEPAY_API_KEY;
  if (!key) throw new Error("Chave da InfinitePay não configurada");
  return { "Content-Type": "application/json", Accept: "application/json", "X-Api-Key": key };
}

/** The account handle is the first path segment of the returned checkout URL. */
export function handleFromCheckoutUrl(url: string): string {
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[0] ?? "";
  } catch {
    return "";
  }
}

export function slugFromCheckoutUrl(url: string): string {
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[1] ?? "";
  } catch {
    return "";
  }
}

/**
 * Asks InfinitePay whether an order was paid. Returns true only when the API
 * explicitly reports paid=true; any error counts as "not paid yet".
 */
export async function infinitePayIsPaid(input: {
  handle?: string;
  order_nsu: string;
  slug?: string;
  transaction_nsu?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${INFINITEPAY_API_BASE_URL}/payment_check`, {
      method: "POST",
      headers: getInfinitePayHeaders(),
      body: JSON.stringify(input),
    });
    const data: any = await res.json().catch(() => ({}));
    return data?.success === true && data?.paid === true;
  } catch (e) {
    console.error("[INFINITEPAY] payment_check falhou:", e);
    return false;
  }
}
