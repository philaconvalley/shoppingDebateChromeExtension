// Reminders Service

import { getReminders, setReminders } from '../../shared/storage.js';
import { REMINDER_DURATION_MS } from '../../shared/constants.js';

/**
 * Create a new reminder
 * @param {object} product - Product information
 * @param {string} url - Product URL
 * @returns {Promise<void>}
 */
export async function createReminder(product, url) {
  const reminder = {
    product,
    remindAt: Date.now() + REMINDER_DURATION_MS,
    url
  };

  const reminders = await getReminders();
  reminders.push(reminder);
  await setReminders(reminders);
}
