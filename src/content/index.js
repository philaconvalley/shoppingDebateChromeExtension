// Content Script - Main Orchestrator

import { isCheckoutPage, extractProductContext } from './checkout.js';
import { getPriceThreshold } from '../shared/storage.js';
import { MESSAGE_TYPES, PERSONALITIES, TOAST_TYPES, DEFAULT_PRICE_THRESHOLD, AUDIO_MESSAGE_TYPES } from '../shared/constants.js';
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
import { initializeTheme, getCharacterConfig, getCurrentTheme, THEMES } from '../themes/theme-switcher.js';

// Application state
let isDebateActive = false;
let currentProduct = null;
let currentTheme = THEMES.DEFAULT;

// Audio playback queue system
const audioQueue = [];
let isPlayingAudio = false;
let currentAudio = null;
let currentSentenceIndex = {};  // Track sentence index per personality
let audioEnabled = false;  // Track if user has enabled audio
let autoplayBlocked = false;  // Track if autoplay was blocked

// Text buffering - store text until audio is ready
const textBuffer = {
  enabler: '',
  skeptic: '',
  mediator: ''
};

/**
 * Add audio to queue and start playback if not already playing
 * @param {string} personality - Personality name
 * @param {string} audioData - Base64 encoded audio data
 * @param {string} sentence - The sentence text being spoken
 */
function enqueueAudio(personality, audioData, sentence) {
  audioQueue.push({ personality, audioData, sentence });
  console.log(`[Audio Queue] Added audio for ${personality}. Queue length: ${audioQueue.length}`);

  // Start playback if not already playing
  if (!isPlayingAudio) {
    playNextAudio();
  }
}

/**
 * Play the next audio in the queue
 */
function playNextAudio() {
  if (audioQueue.length === 0) {
    isPlayingAudio = false;
    console.log('[Audio Queue] Queue empty, stopping playback');
    return;
  }

  isPlayingAudio = true;
  const { personality, audioData, sentence } = audioQueue.shift();

  console.log(`[Audio Queue] Playing audio for ${personality}. Remaining: ${audioQueue.length}`);
  console.log(`[Audio Queue] Sentence: "${sentence?.substring(0, 50)}..."`);

  // Create audio element
  currentAudio = new Audio(audioData);

  // Add visual "speaking" indicator
  const character = document.querySelector(`.${personality}-character`);
  if (character) {
    character.classList.add('speaking');
    console.log(`[Audio] Added speaking indicator for ${personality}`);
  }

  // Update status
  updatePersonalityStatus(personality, 'Speaking...');

  // When audio metadata is loaded, start word-by-word highlighting
  currentAudio.addEventListener('loadedmetadata', () => {
    const duration = currentAudio.duration;
    if (sentence && duration > 0) {
      highlightWordsInSync(personality, sentence, duration);
    }
  });

  // Handle audio completion
  currentAudio.addEventListener('ended', () => {
    console.log(`[Audio] Finished playing ${personality}`);

    // Remove speaking indicator
    if (character) {
      character.classList.remove('speaking');
    }

    // Remove all word highlights
    removeAllWordHighlights(personality);

    // Play next audio in queue
    playNextAudio();
  });

  // Handle audio errors
  currentAudio.addEventListener('error', (error) => {
    console.error(`[Audio] Playback error for ${personality}:`, error);

    // Remove speaking indicator
    if (character) {
      character.classList.remove('speaking');
    }

    // Remove all word highlights
    removeAllWordHighlights(personality);

    // Continue to next audio
    playNextAudio();
  });

  // Start playback
  currentAudio.play().catch(error => {
    console.error(`[Audio] Failed to play audio for ${personality}:`, error);

    // Check if this is an autoplay policy error
    if (!audioEnabled && !autoplayBlocked) {
      autoplayBlocked = true;
      showEnableAudioPrompt();
      console.log('[Audio] Autoplay blocked by browser. Showing enable button.');
      // Put the audio back in queue for retry after user enables
      audioQueue.unshift({ personality, audioData, sentence });
      isPlayingAudio = false;
      return;
    }

    // Remove speaking indicator
    if (character) {
      character.classList.remove('speaking');
    }

    // Remove all word highlights
    removeAllWordHighlights(personality);

    // Continue to next audio
    playNextAudio();
  });
}

/**
 * Highlight words in sync with audio playback (karaoke style)
 * @param {string} personality - Personality name
 * @param {string} sentence - Sentence text to highlight
 * @param {number} duration - Audio duration in seconds
 */
function highlightWordsInSync(personality, sentence, duration) {
  const character = document.querySelector(`.${personality}-character`);
  if (!character) return;

  const contentElement = character.querySelector('.bubble-content');
  if (!contentElement) return;

  // Split sentence into words
  const words = sentence.trim().split(/\s+/);
  const timePerWord = duration / words.length; // Time per word in seconds

  console.log(`[Karaoke] Highlighting ${words.length} words over ${duration.toFixed(2)}s (${(timePerWord * 1000).toFixed(0)}ms per word)`);

  // Find where this sentence appears in the content
  const contentText = contentElement.textContent;
  const sentenceStart = contentText.indexOf(sentence);

  if (sentenceStart === -1) {
    console.warn('[Karaoke] Could not find sentence in content');
    return;
  }

  // Convert plain text to word spans for highlighting
  const beforeSentence = contentText.substring(0, sentenceStart);
  const afterSentence = contentText.substring(sentenceStart + sentence.length);

  // Create word spans
  const wordSpans = words.map((word, index) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.setAttribute('data-word-index', index);
    span.textContent = word;
    return span;
  });

  // Rebuild content with word spans
  contentElement.innerHTML = '';
  if (beforeSentence) {
    contentElement.appendChild(document.createTextNode(beforeSentence));
  }

  wordSpans.forEach((span, index) => {
    contentElement.appendChild(span);
    if (index < wordSpans.length - 1) {
      contentElement.appendChild(document.createTextNode(' '));
    }
  });

  if (afterSentence) {
    contentElement.appendChild(document.createTextNode(afterSentence));
  }

  // Highlight words progressively
  let currentWordIndex = 0;
  const highlightInterval = setInterval(() => {
    if (currentWordIndex > 0) {
      // Remove highlight from previous word
      const prevWord = contentElement.querySelector(`[data-word-index="${currentWordIndex - 1}"]`);
      if (prevWord) {
        prevWord.classList.remove('word-highlight');
      }
    }

    if (currentWordIndex < words.length) {
      // Highlight current word
      const currentWord = contentElement.querySelector(`[data-word-index="${currentWordIndex}"]`);
      if (currentWord) {
        currentWord.classList.add('word-highlight');
        currentWord.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      currentWordIndex++;
    } else {
      // All words highlighted, stop
      clearInterval(highlightInterval);
    }
  }, timePerWord * 1000);

  // Store interval ID for cleanup
  contentElement.setAttribute('data-highlight-interval', highlightInterval);
}

/**
 * Remove all word highlights for a personality
 * @param {string} personality - Personality name
 */
function removeAllWordHighlights(personality) {
  const character = document.querySelector(`.${personality}-character`);
  if (!character) return;

  const contentElement = character.querySelector('.bubble-content');
  if (!contentElement) return;

  // Clear any active highlight interval
  const intervalId = contentElement.getAttribute('data-highlight-interval');
  if (intervalId) {
    clearInterval(parseInt(intervalId));
    contentElement.removeAttribute('data-highlight-interval');
  }

  // Remove all word highlight classes
  const highlightedWords = contentElement.querySelectorAll('.word-highlight');
  highlightedWords.forEach(word => {
    word.classList.remove('word-highlight');
  });

  // Convert word spans back to plain text
  const wordSpans = contentElement.querySelectorAll('.word');
  wordSpans.forEach(span => {
    const textNode = document.createTextNode(span.textContent);
    span.replaceWith(textNode);
  });

  console.log(`[Karaoke] Cleared word highlights for ${personality}`);
}

/**
 * Show the enable audio prompt when autoplay is blocked
 */
function showEnableAudioPrompt() {
  const modal = getDebateModal();
  if (!modal) return;

  const prompt = modal.querySelector('.audio-enable-prompt');
  if (prompt) {
    prompt.style.display = 'block';

    // Attach click handler to enable button
    const enableBtn = prompt.querySelector('.enable-audio-btn');
    if (enableBtn && !enableBtn.hasAttribute('data-handler-attached')) {
      enableBtn.setAttribute('data-handler-attached', 'true');
      enableBtn.addEventListener('click', handleEnableAudio);
    }
  }
}

/**
 * Hide the enable audio prompt
 */
function hideEnableAudioPrompt() {
  const modal = getDebateModal();
  if (!modal) return;

  const prompt = modal.querySelector('.audio-enable-prompt');
  if (prompt) {
    prompt.style.display = 'none';
  }
}

/**
 * Handle enable audio button click
 */
function handleEnableAudio() {
  console.log('[Audio] User enabled audio playback');
  audioEnabled = true;
  hideEnableAudioPrompt();

  // Resume audio playback from queue
  if (audioQueue.length > 0 && !isPlayingAudio) {
    playNextAudio();
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Stop all audio playback and clear queue
 */
function stopAllAudio() {
  // Stop current audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Clear queue
  audioQueue.length = 0;
  isPlayingAudio = false;

  // Remove all speaking indicators
  [PERSONALITIES.ENABLER, PERSONALITIES.SKEPTIC, PERSONALITIES.MEDIATOR].forEach(p => {
    const character = document.querySelector(`.${p}-character`);
    if (character) {
      character.classList.remove('speaking');
    }
  });

  console.log('[Audio] Stopped all audio and cleared queue');
}

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
  stopAllAudio();
  closeDebateModal();
  isDebateActive = false;
}

/**
 * Start the debate
 */
async function startDebate() {
  if (isDebateActive) return;

  isDebateActive = true;
  await showDebateModal(currentTheme);

  // Attach event handlers
  attachCloseHandler(handleClose);
  attachRemindHandler(handleRemindLater);
  attachReconsiderHandler(handleReconsider);
  attachProceedHandler(handleProceed);

  // Reset all personalities
  [PERSONALITIES.ENABLER, PERSONALITIES.SKEPTIC, PERSONALITIES.MEDIATOR].forEach(p => {
    clearPersonalityResponse(p);
    updatePersonalityStatus(p, 'Waiting...');
    // Clear text buffer
    textBuffer[p] = '';
  });

  // Extract context and send to background
  const productContext = extractProductContext();

  // Store current product info
  currentProduct = {
    url: productContext.url,
    title: productContext.productName || productContext.title,
    price: productContext.price || 'Price not detected',
    brand: productContext.brand
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

  if (!productContext.price) {
    return true; // No price detected, trigger anyway
  }

  const priceValue = extractPriceValue(productContext.price);

  return priceValue >= priceThreshold;
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MESSAGE_TYPES.PERSONALITY_START:
      // Clear previous response (important for Round 4 when Enabler speaks again)
      clearPersonalityResponse(message.personality);
      textBuffer[message.personality] = '';
      updatePersonalityStatus(message.personality, 'Thinking...');
      break;

    case MESSAGE_TYPES.PERSONALITY_CHUNK:
      // Stream text word-by-word as it arrives (karaoke style)
      appendPersonalityChunk(message.personality, message.chunk);
      textBuffer[message.personality] += message.chunk;
      updatePersonalityStatus(message.personality, 'Speaking...');
      break;

    case MESSAGE_TYPES.PERSONALITY_COMPLETE:
      updatePersonalityStatus(message.personality, 'Audio ready');
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

    // Audio message types
    case AUDIO_MESSAGE_TYPES.PERSONALITY_AUDIO:
      console.log(`[Audio] Received audio for ${message.personality}`);
      enqueueAudio(message.personality, message.audioData, message.sentence);
      break;

    case AUDIO_MESSAGE_TYPES.PERSONALITY_AUDIO_COMPLETE:
      console.log(`[Audio] Audio generation complete for ${message.personality}`);
      break;

    default:
      break;
  }
});

/**
 * Auto-trigger on product pages with price threshold check
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

// Initialize theme on page load
initializeTheme().then(theme => {
  currentTheme = theme;
  console.log(`[ShoppingDebate] Content script loaded with theme: ${theme}`);
});

// Listen for theme changes from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Content] Received message:', message.type);

  if (message.type === 'THEME_CHANGED') {
    console.log(`[ThemeChange] Received THEME_CHANGED message`);
    console.log(`[ThemeChange] Switching from "${currentTheme}" to "${message.themeId}"`);

    currentTheme = message.themeId;

    // Force modal recreation on next open with new theme
    const modal = getDebateModal();
    if (modal) {
      console.log('[ThemeChange] Modal is open, closing it');
      closeDebateModal();
    } else {
      console.log('[ThemeChange] No modal currently open');
    }

    // Re-initialize theme
    initializeTheme().then(() => {
      console.log(`[ThemeChange] Theme initialized to: ${currentTheme}`);
      sendResponse({ success: true, theme: currentTheme });
    });

    return true; // Keep message channel open for async response
  }
});

console.log('Shopping Debate content script loaded');
