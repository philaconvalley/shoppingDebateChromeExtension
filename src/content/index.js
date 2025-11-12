// Content Script - Debate Modal and Message Handling
import { isCheckoutPage, extractProductContext } from './checkout.js';
import { themeEngine } from '../themes/theme-engine.js';

let debateModal = null;
let isDebateActive = false;
let currentThemeConfig = null;

/**
 * Create the debate modal UI dynamically based on current theme
 */
async function createDebateModal() {
  if (debateModal) return debateModal;

  // Ensure theme engine is initialized
  await themeEngine.initialize();
  currentThemeConfig = themeEngine.getConfig();

  const personalities = themeEngine.getPersonalities();
  const ui = themeEngine.getUIConfig();
  const copy = themeEngine.getCopy();

  // Inject base CSS and theme-specific CSS
  injectStylesheets();

  // Apply theme to document root
  themeEngine.applyThemeToDOM();

  // Build personality cards HTML dynamically
  const personalityCardsHTML = personalities.map(p => `
    <div class="personality-card ${p.id}" data-role="${p.role}">
      <div class="personality-header">
        <div class="personality-icon">${p.icon}</div>
        <div class="personality-info">
          <h3 class="personality-name">${p.name}</h3>
          <p class="personality-status">${copy.states.loading}</p>
        </div>
      </div>
      <div class="personality-response"></div>
    </div>
  `).join('');

  const modal = document.createElement('div');
  modal.id = 'shopping-debate-modal';
  modal.innerHTML = `
    <div class="debate-overlay"></div>
    <div class="debate-container">
      <div class="debate-header">
        <h2>${ui.modal.title}</h2>
        <button class="debate-close" aria-label="${copy.buttons.close}">&times;</button>
      </div>

      <div class="debate-content">
        ${personalityCardsHTML}
      </div>

      <div class="debate-footer">
        <button class="debate-button proceed">${copy.buttons.proceed}</button>
        <button class="debate-button reconsider">${copy.buttons.reconsider}</button>
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

/**
 * Inject base CSS and theme-specific stylesheets
 */
function injectStylesheets() {
  // Check if already injected
  if (document.getElementById('debate-base-css')) return;

  // Inject base CSS
  const baseLink = document.createElement('link');
  baseLink.id = 'debate-base-css';
  baseLink.rel = 'stylesheet';
  baseLink.href = chrome.runtime.getURL('themes/styles/base.css');
  document.head.appendChild(baseLink);

  // Inject theme-specific CSS
  themeEngine.injectStylesheet(document);

  // Also inject legacy debate-modal.css for fallback
  const legacyLink = document.createElement('link');
  legacyLink.id = 'debate-modal-css';
  legacyLink.rel = 'stylesheet';
  legacyLink.href = chrome.runtime.getURL('content/debate-modal.css');
  document.head.appendChild(legacyLink);
}

// Show the debate modal
async function showDebateModal() {
  const modal = await createDebateModal();
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
async function startDebate() {
  if (isDebateActive) return;

  isDebateActive = true;
  await showDebateModal();

  // Ensure theme is loaded
  await themeEngine.initialize();
  const personalities = themeEngine.getPersonalities();
  const copy = themeEngine.getCopy();

  // Reset all personalities using theme-aware IDs
  personalities.forEach(p => {
    clearPersonalityResponse(p.id);
    updatePersonalityStatus(p.id, copy.states.loading);
  });

  // Extract context and send to background
  const productContext = extractProductContext();

  chrome.runtime.sendMessage({
    type: 'generateDebateStreaming',
    productContext: productContext
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // Ensure theme config is loaded
  if (!currentThemeConfig && themeEngine) {
    await themeEngine.initialize();
    currentThemeConfig = themeEngine.getConfig();
  }

  const copy = currentThemeConfig?.copy || {
    states: {
      thinking: 'Thinking...',
      error: 'Error occurred',
    }
  };

  if (message.type === 'personalityStart') {
    updatePersonalityStatus(message.personality, copy.states.thinking);
  }

  if (message.type === 'personalityChunk') {
    appendPersonalityChunk(message.personality, message.chunk);
    updatePersonalityStatus(message.personality, copy.states.thinking);
  }

  if (message.type === 'personalityComplete') {
    // Keep showing thinking state or use a custom "complete" state if defined
    updatePersonalityStatus(message.personality, '✓');
  }

  if (message.type === 'debateComplete') {
    console.log('[Theme: ' + themeEngine.currentTheme + '] Debate complete!');
  }

  if (message.type === 'debateError') {
    console.error('Debate error:', message.error);
    alert(`${copy.states.error}: ${message.error}`);
    closeDebateModal();
  }

  if (message.type === 'triggerDebate') {
    startDebate();
  }

  if (message.type === 'THEME_CHANGED') {
    // Reload theme if changed from popup/options
    console.log('[ThemeChanged] Reloading theme:', message.themeId);
    currentThemeConfig = null;
    debateModal = null; // Force recreation with new theme
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
