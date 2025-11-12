// Content Script - Debate Modal and Message Handling
import { isCheckoutPage, extractProductContext } from './checkout.js';

let debateModal = null;
let isDebateActive = false;
let currentProduct = null; // Store current product for reminders/tracking

// Create the debate character UI
function createDebateModal() {
  if (debateModal) return debateModal;

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
        <div class="avatar-icon">+</div>
        <div class="avatar-pulse"></div>
      </div>
      <div class="speech-bubble">
        <div class="bubble-header">
          <span class="bubble-name">The Enabler</span>
          <span class="bubble-status">...</span>
        </div>
        <div class="bubble-content"></div>
      </div>
    </div>

    <!-- Skeptic Character -->
    <div class="debate-character skeptic-character">
      <div class="character-avatar">
        <div class="avatar-icon">?</div>
        <div class="avatar-pulse"></div>
      </div>
      <div class="speech-bubble">
        <div class="bubble-header">
          <span class="bubble-name">The Skeptic</span>
          <span class="bubble-status">...</span>
        </div>
        <div class="bubble-content"></div>
      </div>
    </div>

    <!-- Mediator Character -->
    <div class="debate-character mediator-character">
      <div class="character-avatar">
        <div class="avatar-icon">=</div>
        <div class="avatar-pulse"></div>
      </div>
      <div class="speech-bubble">
        <div class="bubble-header">
          <span class="bubble-name">The Mediator</span>
          <span class="bubble-status">...</span>
        </div>
        <div class="bubble-content"></div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="debate-actions">
      <button class="action-btn remind-btn">Remind Me Later</button>
      <button class="action-btn reconsider-btn">I'll Reconsider</button>
      <button class="action-btn proceed-btn">Proceed to Purchase</button>
    </div>

    <!-- Savings Tracker -->
    <div class="savings-tracker">
      <div class="savings-label">This Month</div>
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

    <!-- Close Button -->
    <button class="debate-close-btn">&times;</button>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector('.debate-close-btn').addEventListener('click', closeDebateModal);
  modal.querySelector('.remind-btn').addEventListener('click', handleRemindLater);
  modal.querySelector('.reconsider-btn').addEventListener('click', handleReconsider);
  modal.querySelector('.proceed-btn').addEventListener('click', handleProceed);

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
function showDebateModal() {
  const modal = createDebateModal();
  modal.classList.add('active');
  // Characters slide in - no need to hide page overflow
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
function startDebate() {
  if (isDebateActive) return;

  isDebateActive = true;
  showDebateModal();

  // Reset all personalities
  ['enabler', 'skeptic', 'mediator'].forEach(p => {
    clearPersonalityResponse(p);
    updatePersonalityStatus(p, 'Waiting...');
  });

  // Extract context and send to background
  const productContext = extractProductContext();

  chrome.runtime.sendMessage({
    type: 'generateDebateStreaming',
    productContext: productContext
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

// Auto-trigger on checkout pages
if (isCheckoutPage()) {
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(startDebate, 1000);
    });
  } else {
    setTimeout(startDebate, 1000);
  }
}

console.log('Shopping Debate content script loaded');
