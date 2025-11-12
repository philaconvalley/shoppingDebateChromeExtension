// Content Script - Debate Modal and Message Handling
import { isCheckoutPage, extractProductContext } from './checkout.js';
import { initializeTheme, getCharacterConfig, getCurrentTheme, THEMES, getThemeConfig } from '../themes/theme-switcher.js';

let debateModal = null;
let isDebateActive = false;
let currentProduct = null; // Store current product for reminders/tracking
let currentTheme = THEMES.DEFAULT;

// Create the debate character UI (theme-aware)
async function createDebateModal() {
  if (debateModal) return debateModal;

  // Get current theme and character config
  currentTheme = await getCurrentTheme();
  const enablerChar = getCharacterConfig(currentTheme, 'enabler');
  const skepticChar = getCharacterConfig(currentTheme, 'skeptic');
  const mediatorChar = getCharacterConfig(currentTheme, 'mediator');

  const modal = document.createElement('div');
  modal.id = 'shopping-debate-characters';
  modal.innerHTML = `
    <!-- Price Header -->
    <div class="debate-price-header">
      <div class="price-label">You're considering:</div>
      <div class="price-amount">--</div>
    </div>

    <!-- Enabler Character -->
    <div class="debate-character enabler-character">
      <div class="character-avatar">
        <div class="avatar-icon">${enablerChar.icon}</div>
        <div class="avatar-pulse"></div>
      </div>
      <div class="speech-bubble">
        <div class="bubble-header">
          <span class="bubble-name">${enablerChar.name}</span>
          <span class="bubble-status">...</span>
        </div>
        <div class="bubble-content"></div>
      </div>
    </div>

    <!-- Skeptic Character -->
    <div class="debate-character skeptic-character">
      <div class="character-avatar">
        <div class="avatar-icon">${skepticChar.icon}</div>
        <div class="avatar-pulse"></div>
      </div>
      <div class="speech-bubble">
        <div class="bubble-header">
          <span class="bubble-name">${skepticChar.name}</span>
          <span class="bubble-status">...</span>
        </div>
        <div class="bubble-content"></div>
      </div>
    </div>

    <!-- Mediator Character -->
    <div class="debate-character mediator-character">
      <div class="character-avatar">
        <div class="avatar-icon">${mediatorChar.icon}</div>
        <div class="avatar-pulse"></div>
      </div>
      <div class="speech-bubble">
        <div class="bubble-header">
          <span class="bubble-name">${mediatorChar.name}</span>
          <span class="bubble-status">...</span>
        </div>
        <div class="bubble-content"></div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="debate-actions">
      <button class="action-btn remind-btn">Remind Me Later</button>
      <button class="action-btn reconsider-btn">I'll Reconsider</button>
      <button class="action-btn proceed-btn">${currentTheme === THEMES.REGINA ? "That's So Fetch! 💖" : "Proceed to Purchase"}</button>
    </div>

    <!-- Savings Tracker -->
    <div class="savings-tracker">
      <div class="savings-label">${currentTheme === THEMES.REGINA ? "This Month's Wins 👑" : "This Month"}</div>
      <div class="savings-stats">
        <div class="stat-item">
          <span class="stat-value" id="saved-amount">$0</span>
          <span class="stat-label">Saved</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="reconsidered-count">0</span>
          <span class="stat-label">Reconsidered</span>
        </div>
      </div>
    </div>

    <!-- Sound Toggle -->
    <div class="sound-toggle">
      <button id="sound-toggle-btn">🔊</button>
    </div>

    <!-- Close Button -->
    <button class="debate-close-btn">&times;</button>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector('.debate-close-btn').addEventListener('click', closeDebateModal);
  modal.querySelector('.remind-btn').addEventListener('click', handleRemindLater);
  modal.querySelector('.reconsider-btn').addEventListener('click', handleReconsider);
  modal.querySelector('.proceed-btn').addEventListener('click', handleProceed);

  const soundToggleBtn = modal.querySelector('#sound-toggle-btn');
  soundToggleBtn.addEventListener('click', toggleSound);

  debateModal = modal;
  return modal;
}

// Handle Remind Me Later
async function handleRemindLater() {
  if (!currentProduct) return;

  // Save reminder with 3-day timestamp
  const reminder = {
    product: currentProduct,
    remindAt: Date.now() + (3 * 24 * 60 * 60 * 1000), // 3 days
    url: window.location.href
  };

  const { reminders = [] } = await chrome.storage.local.get(['reminders']);
  reminders.push(reminder);
  await chrome.storage.local.set({ reminders });

  alert('Reminder set for 3 days from now!');
  closeDebateModal();
}

// Handle Reconsider (tracks savings)
async function handleReconsider() {
  if (!currentProduct) return;

  await trackSavings(currentProduct.price);
  alert(`Great decision! You saved ${currentProduct.price || 'money'} by reconsidering.`);
  closeDebateModal();
}

// Handle Proceed to Purchase
function handleProceed() {
  closeDebateModal();
}

// Track savings when user reconsiders
async function trackSavings(priceString) {
  const price = extractPriceValue(priceString);
  if (price <= 0) return;

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { savings = {} } = await chrome.storage.local.get(['savings']);

  if (!savings[currentMonth]) {
    savings[currentMonth] = { amount: 0, count: 0 };
  }

  savings[currentMonth].amount += price;
  savings[currentMonth].count += 1;

  await chrome.storage.local.set({ savings });
  updateSavingsDisplay();
}

// Extract numeric price from string
function extractPriceValue(priceString) {
  if (!priceString) return 0;
  const match = priceString.match(/[\d,]+\.?\d*/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/,/g, ''));
}

// Update savings display
async function updateSavingsDisplay() {
  if (!debateModal) return;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const { savings = {} } = await chrome.storage.local.get(['savings']);
  const monthData = savings[currentMonth] || { amount: 0, count: 0 };

  const amountEl = debateModal.querySelector('#saved-amount');
  const countEl = debateModal.querySelector('#reconsidered-count');

  if (amountEl) amountEl.textContent = `$${monthData.amount.toFixed(0)}`;
  if (countEl) countEl.textContent = monthData.count;
}

// Update price display
function updatePriceDisplay(price) {
  if (!debateModal) return;

  const priceEl = debateModal.querySelector('.price-amount');
  if (priceEl) {
    priceEl.textContent = price || 'Price not detected';
  }
}

// Show the debate characters
async function showDebateModal() {
  // Initialize theme and wait for stylesheet injection
  currentTheme = await initializeTheme();
  
  // Create modal with current theme applied
  const modal = await createDebateModal();
  modal.classList.add('active');
}

// Close the debate characters
function closeDebateModal() {
  if (debateModal) {
    debateModal.classList.remove('active');
    setTimeout(() => {
      debateModal.remove();
      debateModal = null;
    }, 300); // Wait for slide-out animation
    isDebateActive = false;
  }
}

// Update personality status
function updatePersonalityStatus(personality, status) {
  const character = debateModal.querySelector(`.${personality}-character`);
  if (character) {
    const statusEl = character.querySelector('.bubble-status');
    statusEl.textContent = status;

    // Add active class when speaking
    if (status === 'Speaking...') {
      character.classList.add('speaking');

      // Scroll character into view smoothly
      character.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      character.classList.remove('speaking');
    }
  }
}

// Append chunk to personality response
function appendPersonalityChunk(personality, chunk) {
  const character = debateModal.querySelector(`.${personality}-character`);
  if (character) {
    const bubbleContent = character.querySelector('.bubble-content');
    bubbleContent.textContent += chunk;

    // Show bubble if first chunk
    const bubble = character.querySelector('.speech-bubble');
    if (!bubble.classList.contains('visible')) {
      bubble.classList.add('visible');
    }

    // Auto-scroll
    bubbleContent.scrollTop = bubbleContent.scrollHeight;
  }
}

// Clear personality response
function clearPersonalityResponse(personality) {
  const character = debateModal.querySelector(`.${personality}-character`);
  if (character) {
    const bubbleContent = character.querySelector('.bubble-content');
    bubbleContent.textContent = '';

    const bubble = character.querySelector('.speech-bubble');
    bubble.classList.remove('visible');
  }
}

// Start the debate
async function startDebate() {
  if (isDebateActive) return;

  isDebateActive = true;
  await showDebateModal();

  // Reset all personalities
  ['enabler', 'skeptic', 'mediator'].forEach(p => {
    clearPersonalityResponse(p);
    updatePersonalityStatus(p, 'Waiting...');
  });

  // Extract context and send to background
  const productContext = extractProductContext();

  // Extract and store current product info
  currentProduct = {
    url: productContext.url,
    title: productContext.title,
    price: productContext.prices?.[0] || 'Price not detected'
  };

  // Update price display
  updatePriceDisplay(currentProduct.price);

  // Update savings display
  updateSavingsDisplay();

  chrome.runtime.sendMessage({
    type: 'generateDebateStreaming',
    productContext: productContext.formatted
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'personalityStart') {
    updatePersonalityStatus(message.personality, 'Thinking...');
  }

  if (message.type === 'personalityChunk') {
    appendPersonalityChunk(message.personality, message.chunk);
    updatePersonalityStatus(message.personality, 'Responding...');
  }

  if (message.type === 'personalityComplete') {
    updatePersonalityStatus(message.personality, 'Complete');
  }

  if (message.type === 'debateComplete') {
    console.log('Debate complete!');
  }

  if (message.type === 'debateError') {
    console.error('Debate error:', message.error);
    alert(`Error: ${message.error}`);
    closeDebateModal();
  }

  if (message.type === 'triggerDebate') {
    startDebate();
  }
});

// Check if price meets threshold
async function shouldTriggerDebate() {
  const { priceThreshold = 50 } = await chrome.storage.sync.get(['priceThreshold']);

  // Extract product context to get price
  const productContext = extractProductContext();

  if (productContext.prices.length === 0) {
    // No price detected, trigger anyway
    return true;
  }

  // Get the first price and extract numeric value
  const priceString = productContext.prices[0];
  const priceValue = extractPriceValue(priceString);

  // Trigger if price meets or exceeds threshold
  return priceValue >= priceThreshold;
}

// Auto-trigger on checkout pages with price threshold check
if (isCheckoutPage()) {
  // Wait for page to be fully loaded
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

// Initialize theme on page load
initializeTheme().then(theme => {
  console.log(`[ShoppingDebate] Content script loaded with theme: ${theme}`);
});

// Listen for theme changes from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'THEME_CHANGED') {
    console.log(`[ThemeChange] Switching to: ${message.themeId}`);
    currentTheme = message.themeId;
    // Force modal recreation on next open
    if (debateModal) {
      debateModal.remove();
      debateModal = null;
    }
    initializeTheme();
  }
});

// Toggle sound
async function toggleSound() {
  const { sound = true } = await chrome.storage.sync.get(['sound']);
  await chrome.storage.sync.set({ sound: !sound });
  updateSoundToggle();
}

// Update sound toggle
async function updateSoundToggle() {
  if (!debateModal) return;
  const { sound = true } = await chrome.storage.sync.get(['sound']);
  const btn = debateModal.querySelector('#sound-toggle-btn');
  if (btn) btn.textContent = sound ? '🔊' : '🔇';
}

console.log('Shopping Debate content script loaded');
