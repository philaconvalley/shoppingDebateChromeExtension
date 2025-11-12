// Background Service Worker - Main Orchestrator

import { MESSAGE_TYPES } from '../shared/constants.js';
import { getApiKeys, getNextKeyIndex } from './config/keys.js';
import { handleStreamingDebate } from './services/debate.js';
import {
  setupReminderAlarm,
  checkDueReminders,
  handleAlarm,
  handleNotificationClick,
  handleNotificationButtonClick
} from './services/reminders.js';

/**
 * Initialize the background service worker
 */
async function initialize() {
  // Set up reminder checking alarm
  setupReminderAlarm();

  // Check reminders immediately on startup
  await checkDueReminders();

  console.log('Shopping Debate background service worker loaded');
}

/**
 * Handle messages from content script and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.GENERATE_DEBATE_STREAMING) {
    // Start async debate generation
    (async () => {
      const apiKeys = await getApiKeys();
      await handleStreamingDebate(
        message.productContext,
        sender.tab.id,
        apiKeys,
        getNextKeyIndex
      );
    })();

    sendResponse({ status: 'started' });
    return true; // Keep message channel open
  }

  if (message.type === MESSAGE_TYPES.TEST_DEBATE) {
    const testContext = `Product: Test Product
Price: $99.99
URL: ${message.url || 'test-page'}`;

    (async () => {
      const apiKeys = await getApiKeys();
      await handleStreamingDebate(
        testContext,
        sender.tab.id,
        apiKeys,
        getNextKeyIndex
      );
    })();

    sendResponse({ status: 'started' });
    return true;
  }
});

// Listen for alarm to check reminders
chrome.alarms.onAlarm.addListener(handleAlarm);

// Handle notification clicks
chrome.notifications.onClicked.addListener(handleNotificationClick);

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(handleNotificationButtonClick);

// Initialize on load
initialize();
