// Debate Modal UI Module

let debateModal = null;

/**
 * Create the debate modal UI
 * @returns {HTMLElement} - The modal element
 */
export function createDebateModal() {
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
  debateModal = modal;
  return modal;
}

/**
 * Show the debate modal
 */
export function showDebateModal() {
  const modal = createDebateModal();
  modal.classList.add('active');
}

/**
 * Close and remove the debate modal
 */
export function closeDebateModal() {
  if (debateModal) {
    debateModal.classList.remove('active');
    setTimeout(() => {
      debateModal.remove();
      debateModal = null;
    }, 300);
  }
}

/**
 * Get the debate modal element
 * @returns {HTMLElement|null}
 */
export function getDebateModal() {
  return debateModal;
}

/**
 * Update personality status
 * @param {string} personality - Personality name
 * @param {string} status - Status text
 */
export function updatePersonalityStatus(personality, status) {
  if (!debateModal) return;

  const character = debateModal.querySelector(`.${personality}-character`);
  if (character) {
    const statusEl = character.querySelector('.bubble-status');
    statusEl.textContent = status;

    if (status === 'Speaking...') {
      character.classList.add('speaking');
      character.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      character.classList.remove('speaking');
    }
  }
}

/**
 * Append text chunk to personality response
 * @param {string} personality - Personality name
 * @param {string} chunk - Text chunk to append
 */
export function appendPersonalityChunk(personality, chunk) {
  if (!debateModal) return;

  const character = debateModal.querySelector(`.${personality}-character`);
  if (character) {
    const bubbleContent = character.querySelector('.bubble-content');
    bubbleContent.textContent += chunk;

    const bubble = character.querySelector('.speech-bubble');
    if (!bubble.classList.contains('visible')) {
      bubble.classList.add('visible');
    }

    bubbleContent.scrollTop = bubbleContent.scrollHeight;
  }
}

/**
 * Clear personality response
 * @param {string} personality - Personality name
 */
export function clearPersonalityResponse(personality) {
  if (!debateModal) return;

  const character = debateModal.querySelector(`.${personality}-character`);
  if (character) {
    const bubbleContent = character.querySelector('.bubble-content');
    bubbleContent.textContent = '';

    const bubble = character.querySelector('.speech-bubble');
    bubble.classList.remove('visible');
  }
}

/**
 * Update price display
 * @param {string} price - Price string to display
 */
export function updatePriceDisplay(price) {
  if (!debateModal) return;

  const priceEl = debateModal.querySelector('.price-amount');
  if (priceEl) {
    priceEl.textContent = price || 'Price not detected';
  }
}

/**
 * Attach event listener to close button
 * @param {Function} handler - Click handler
 */
export function attachCloseHandler(handler) {
  if (!debateModal) return;

  const closeBtn = debateModal.querySelector('.debate-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', handler);
  }
}

/**
 * Attach event listener to Remind Me Later button
 * @param {Function} handler - Click handler
 */
export function attachRemindHandler(handler) {
  if (!debateModal) return;

  const remindBtn = debateModal.querySelector('.remind-btn');
  if (remindBtn) {
    remindBtn.addEventListener('click', handler);
  }
}

/**
 * Attach event listener to Reconsider button
 * @param {Function} handler - Click handler
 */
export function attachReconsiderHandler(handler) {
  if (!debateModal) return;

  const reconsiderBtn = debateModal.querySelector('.reconsider-btn');
  if (reconsiderBtn) {
    reconsiderBtn.addEventListener('click', handler);
  }
}

/**
 * Attach event listener to Proceed button
 * @param {Function} handler - Click handler
 */
export function attachProceedHandler(handler) {
  if (!debateModal) return;

  const proceedBtn = debateModal.querySelector('.proceed-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', handler);
  }
}
