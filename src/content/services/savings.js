// Savings Tracking Service

import { getSavings, setSavings } from '../../shared/storage.js';
import { extractPriceValue } from '../utils/price.js';

/**
 * Track savings when user reconsiders a purchase
 * @param {string} priceString - Price string (e.g., "$99.99")
 * @returns {Promise<void>}
 */
export async function trackSavings(priceString) {
  const price = extractPriceValue(priceString);
  if (price <= 0) return;

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const savings = await getSavings();

  if (!savings[currentMonth]) {
    savings[currentMonth] = { amount: 0, count: 0 };
  }

  savings[currentMonth].amount += price;
  savings[currentMonth].count += 1;

  await setSavings(savings);
}

/**
 * Get current month's savings data
 * @returns {Promise<{amount: number, count: number}>}
 */
export async function getCurrentMonthSavings() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const savings = await getSavings();

  return savings[currentMonth] || { amount: 0, count: 0 };
}

/**
 * Update savings display in the modal
 * @param {HTMLElement} modal - Debate modal element
 */
export async function updateSavingsDisplay(modal) {
  if (!modal) return;

  const monthData = await getCurrentMonthSavings();

  const amountEl = modal.querySelector('#saved-amount');
  const countEl = modal.querySelector('#reconsidered-count');

  if (amountEl) amountEl.textContent = `$${monthData.amount.toFixed(0)}`;
  if (countEl) countEl.textContent = monthData.count;
}
