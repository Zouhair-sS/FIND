/**
 * Formats a price in Moroccan Dirham (MAD) with dot as thousands separator.
 * Example: 28976 → "28.976"
 * 
 * @param price - The numeric price value
 * @returns The formatted price string (without "MAD" suffix — add that in JSX)
 */
export function formatPrice(price: number): string {
  const rounded = Math.round(price);
  // Use dot as thousands separator (Moroccan convention)
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formats a price difference (e.g., storage upgrade cost).
 * Example: 1870 → "+1.870"
 * 
 * @param diff - The numeric price difference
 * @returns The formatted string with + prefix
 */
export function formatPriceDiff(diff: number): string {
  const rounded = Math.round(diff);
  return '+' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
