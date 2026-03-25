/**
 * Currency Symbols Mapping and Utilities
 * Centralized currency symbol definitions and lookup functions
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CHF: "Fr",
  CNY: "¥",
  INR: "₹",
  MXN: "MX$",
  NGN: "₦",
};

/**
 * Get the symbol for a currency code.
 * Uses mapped symbols first, then falls back to Intl.NumberFormat,
 * and finally returns universal currency symbol (¤) if all else fails.
 */
export function getCurrencySymbol(currencyCode: string): string {
  const mappedSymbol = CURRENCY_SYMBOLS[currencyCode];
  if (mappedSymbol) return mappedSymbol;

  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    const symbol = parts.find((part) => part.type === "currency")?.value;
    if (!symbol || symbol === currencyCode) return "¤";
    return symbol;
  } catch {
    return "¤";
  }
}
