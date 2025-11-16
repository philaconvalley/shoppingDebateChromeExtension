// Reminder Notification Service

import { getReminders, setReminders } from '../../shared/storage.js';
import { REMINDER_CHECK_INTERVAL } from '../../shared/constants.js';

/**
 * Set up alarm to check reminders periodically
 */
export function setupReminderAlarm() {
  chrome.alarms.create('checkReminders', { periodInMinutes: REMINDER_CHECK_INTERVAL });
}

/**
 * Check for due reminders and send notifications
 */
export async function checkDueReminders() {
  const reminders = await getReminders();
  const now = Date.now();
  const dueReminders = [];
  const remainingReminders = [];

  reminders.forEach(reminder => {
    if (reminder.remindAt <= now) {
      dueReminders.push(reminder);
    } else {
      remainingReminders.push(reminder);
    }
  });

  // Send notifications for due reminders
  for (const reminder of dueReminders) {
    const price = reminder.product?.price || 'Price unknown';
    const title = reminder.product?.title || 'Product';

    chrome.notifications.create(reminder.url, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Shopping Reminder',
      message: `Remember this purchase?\n${title}\n${price}`,
      buttons: [
        { title: 'View Product' },
        { title: 'Dismiss' }
      ],
      requireInteraction: true
    });
  }

  // Update storage with only remaining reminders
  if (dueReminders.length > 0) {
    await setReminders(remainingReminders);
  }
}

/**
 * Handle alarm events
 * @param {chrome.alarms.Alarm} alarm - Alarm object
 */
export function handleAlarm(alarm) {
  if (alarm.name === 'checkReminders') {
    checkDueReminders();
  }
}

/**
 * Handle notification clicks
 * @param {string} notificationId - Notification ID (URL)
 */
export function handleNotificationClick(notificationId) {
  chrome.tabs.create({ url: notificationId });
  chrome.notifications.clear(notificationId);
}

/**
 * Handle notification button clicks
 * @param {string} notificationId - Notification ID (URL)
 * @param {number} buttonIndex - Button index
 */
export function handleNotificationButtonClick(notificationId, buttonIndex) {
  if (buttonIndex === 0) {
    // "View Product" button
    chrome.tabs.create({ url: notificationId });
  }
  // Both buttons dismiss the notification
  chrome.notifications.clear(notificationId);
}
