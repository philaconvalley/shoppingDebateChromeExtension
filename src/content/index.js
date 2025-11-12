// Content Script - Debate Modal and Message Handling
import { isCheckoutPage, extractProductContext } from './checkout.js';

let debateModal = null;
let isDebateActive = false;

// Create the debate modal UI
function createDebateModal() {
  if (debateModal) return debateModal;

  const modal = document.createElement('div');
  modal.id = 'shopping-debate-modal';
  modal.innerHTML = `
    <div class="debate-overlay"></div>
    <div class="debate-container">
      <div class="debate-header">
        <h2>Shopping Debate</h2>
        <p>Three AI personalities discuss your purchase</p>
        <button class="debate-close">&times;</button>
      </div>

      <div class="debate-content">
        <!-- Enabler -->
        <div class="personality-card enabler">
          <div class="personality-header">
            <div class="personality-icon">🎉</div>
            <div class="personality-info">
              <h3>The Enabler</h3>
              <p class="personality-status">Waiting...</p>
            </div>
          </div>
          <div class="personality-response"></div>
        </div>

        <!-- Skeptic -->
        <div class="personality-card skeptic">
          <div class="personality-header">
            <div class="personality-icon">🤔</div>
            <div class="personality-info">
              <h3>The Skeptic</h3>
              <p class="personality-status">Waiting...</p>
            </div>
          </div>
          <div class="personality-response"></div>
        </div>

        <!-- Mediator -->
        <div class="personality-card mediator">
          <div class="personality-header">
            <div class="personality-icon">⚖️</div>
            <div class="personality-info">
              <h3>The Mediator</h3>
              <p class="personality-status">Waiting...</p>
            </div>
          </div>
          <div class="personality-response"></div>
        </div>
      </div>

      <div class="debate-footer">
        <button class="debate-button proceed">Proceed to Checkout</button>
        <button class="debate-button reconsider">Reconsider Purchase</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector('.debate-close').addEventListener('click', closeDebateModal);
  modal.querySelector('.debate-overlay').addEventListener('click', closeDebateModal);
  modal.querySelector('.proceed').addEventListener('click', () => {
    closeDebateModal();
  });
  modal.querySelector('.reconsider').addEventListener('click', () => {
    closeDebateModal();
    window.history.back();
  });

  debateModal = modal;
  return modal;
}

// Show the debate modal
function showDebateModal() {
  const modal = createDebateModal();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close the debate modal
function closeDebateModal() {
  if (debateModal) {
    debateModal.classList.remove('active');
    document.body.style.overflow = '';
    isDebateActive = false;
  }
}

// Update personality status
function updatePersonalityStatus(personality, status) {
  const card = debateModal.querySelector(`.personality-card.${personality}`);
  if (card) {
    const statusEl = card.querySelector('.personality-status');
    statusEl.textContent = status;
  }
}

// Append chunk to personality response
function appendPersonalityChunk(personality, chunk) {
  const card = debateModal.querySelector(`.personality-card.${personality}`);
  if (card) {
    const responseEl = card.querySelector('.personality-response');
    responseEl.textContent += chunk;

    // Auto-scroll
    responseEl.scrollTop = responseEl.scrollHeight;
  }
}

// Clear personality response
function clearPersonalityResponse(personality) {
  const card = debateModal.querySelector(`.personality-card.${personality}`);
  if (card) {
    const responseEl = card.querySelector('.personality-response');
    responseEl.textContent = '';
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
