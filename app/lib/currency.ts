/**
 * Currency conversion using HexaRate API
 * https://hexarate.paikama.co
 */

const rateCache = new Map<string, { rate: number; fetchedAt: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Get the exchange rate from one currency to another.
 * Returns the mid-market rate (1 unit of `from` = X units of `to`).
 */
export async function getExchangeRate(
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return 1;

  const key = `${from}:${to}`;
  const cached = rateCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.rate;
  }

  try {
    const res = await fetch(
      `https://hexarate.paikama.co/api/rates/${from}/${to}/latest`,
    );
    if (!res.ok) throw new Error(`HexaRate returned ${res.status}`);
    const json = await res.json();
    const rate: number = json.data.mid;

    rateCache.set(key, { rate, fetchedAt: Date.now() });
    return rate;
  } catch (err) {
    console.error(`Failed to fetch exchange rate ${from} -> ${to}:`, err);
    // Return cached value even if stale, or 1 as last resort
    return cached?.rate ?? 1;
  }
}

/**
 * Convert an amount from one currency to another.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  const rate = await getExchangeRate(from, to);
  return amount * rate;
}

/**
 * Prefetch exchange rates for a set of currencies to the target currency.
 * Fetches all rates in parallel for better performance.
 */
export async function prefetchRates(
  currencies: string[],
  target: string,
): Promise<Map<string, number>> {
  const unique = [...new Set(currencies.filter((c) => c !== target))];
  const rates = new Map<string, number>();
  rates.set(target, 1);

  const results = await Promise.all(
    unique.map(async (from) => {
      const rate = await getExchangeRate(from, target);
      return [from, rate] as const;
    }),
  );

  for (const [from, rate] of results) {
    rates.set(from, rate);
  }

  return rates;
}

/**
 * Convert an amount using a pre-fetched rates map.
 */
export function convertWithRates(
  amount: number,
  from: string,
  rates: Map<string, number>,
): number {
  const rate = rates.get(from) ?? 1;
  return amount * rate;
}
