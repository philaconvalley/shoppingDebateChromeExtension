// Price Extraction Utilities

/**
 * Extract numeric price value from a price string
 * @param {string} priceString - Price string (e.g., "$99.99")
 * @returns {number} - Numeric price value
 */
export function extractPriceValue(priceString) {
  if (!priceString) return 0;

  const match = priceString.match(/[\d,]+\.?\d*/);
  if (!match) return 0;

  return parseFloat(match[0].replace(/,/g, ''));
}
