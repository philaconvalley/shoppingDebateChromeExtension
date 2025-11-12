// Content Script - Main Orchestrator

import { isCheckoutPage, extractProductContext } from './checkout.js';
import { getPriceThreshold } from '../shared/storage.js';
import { MESSAGE_TYPES, PERSONALITIES, TOAST_TYPES, DEFAULT_PRICE_THRESHOLD } from '../shared/constants.js';
import { extractPriceValue } from './utils/price.js';
import { trackSavings, updateSavingsDisplay } from './services/savings.js';
import { createReminder } from './services/reminders.js';
import { showToast } from './ui/toast.js';
import {
  createDebateModal,
  showDebateModal,
  closeDebateModal,
  getDebateModal,
  updatePersonalityStatus,
  appendPersonalityChunk,
  clearPersonalityResponse,
  updatePriceDisplay,
  attachCloseHandler,
  attachRemindHandler,
  attachReconsiderHandler,
  attachProceedHandler
} from './ui/modal.js';

// Application state
let isDebateActive = false;
let currentProduct = null;

/**
 * Handle Remind Me Later button click
 */
async function handleRemindLater() {
  if (!currentProduct) return;

  await createReminder(currentProduct, window.location.href);
  showToast('Reminder set for 3 days from now!', TOAST_TYPES.INFO);
  closeDebateModal();
}

/**
 * Handle Reconsider button click
 */
async function handleReconsider() {
  if (!currentProduct) return;

  await trackSavings(currentProduct.price);
  showToast(`Great decision! You saved ${currentProduct.price || 'money'} by reconsidering.`, TOAST_TYPES.SUCCESS);
  closeDebateModal();
}

/**
 * Handle Proceed to Purchase button click
 */
function handleProceed() {
  closeDebateModal();
}

/**
 * Handle close button click
 */
function handleClose() {
  closeDebateModal();
  isDebateActive = false;
}

/**
 * Start the debate
 */
function startDebate() {
  if (isDebateActive) return;

  isDebateActive = true;
  showDebateModal();

  // Attach event handlers
  attachCloseHandler(handleClose);
  attachRemindHandler(handleRemindLater);
  attachReconsiderHandler(handleReconsider);
  attachProceedHandler(handleProceed);

  // Reset all personalities
  [PERSONALITIES.ENABLER, PERSONALITIES.SKEPTIC, PERSONALITIES.MEDIATOR].forEach(p => {
    clearPersonalityResponse(p);
    updatePersonalityStatus(p, 'Waiting...');
  });

  // Extract context and send to background
  const productContext = extractProductContext();

  // Store current product info
  currentProduct = {
    url: productContext.url,
    title: productContext.title,
    price: productContext.prices?.[0] || 'Price not detected'
  };

  // Update price display
  updatePriceDisplay(currentProduct.price);

  // Update savings display
  const modal = getDebateModal();
  updateSavingsDisplay(modal);

  // Send message to background to start debate
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.GENERATE_DEBATE_STREAMING,
    productContext: productContext.formatted
  });
}

/**
 * Check if price meets threshold
 * @returns {Promise<boolean>}
 */
async function shouldTriggerDebate() {
  const priceThreshold = await getPriceThreshold() ?? DEFAULT_PRICE_THRESHOLD;

  const productContext = extractProductContext();

  if (productContext.prices.length === 0) {
    return true; // No price detected, trigger anyway
  }

  const priceString = productContext.prices[0];
  const priceValue = extractPriceValue(priceString);

  return priceValue >= priceThreshold;
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MESSAGE_TYPES.PERSONALITY_START:
      updatePersonalityStatus(message.personality, 'Thinking...');
      break;

    case MESSAGE_TYPES.PERSONALITY_CHUNK:
      appendPersonalityChunk(message.personality, message.chunk);
      updatePersonalityStatus(message.personality, 'Responding...');
      break;

    case MESSAGE_TYPES.PERSONALITY_COMPLETE:
      updatePersonalityStatus(message.personality, 'Complete');
      break;

    case MESSAGE_TYPES.DEBATE_COMPLETE:
      console.log('Debate complete!');
      break;

    case MESSAGE_TYPES.DEBATE_ERROR:
      console.error('Debate error:', message.error);
      showToast(`Error: ${message.error}`, TOAST_TYPES.ERROR);
      closeDebateModal();
      break;

    case MESSAGE_TYPES.TRIGGER_DEBATE:
      startDebate();
      break;

    default:
      break;
  }
});

/**
 * Auto-trigger on checkout pages with price threshold check
 */
if (isCheckoutPage()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      if (await shouldTriggerDebate()) {
        setTimeout(startDebate, 1000);
      }
    });
  } else {
    shouldTriggerDebate().then(shouldTrigger => {
      if (shouldTrigger) {
        setTimeout(startDebate, 1000);
      }
    });
  }
}

console.log('Shopping Debate content script loaded');
