// Modal HTML Template

/**
 * Get the modal HTML template
 * @returns {string} - HTML template string
 */
export function getModalTemplate() {
  return `
    <!-- Price Header with Savings -->
    <div class="debate-price-header">
      <div class="price-section">
        <div class="price-label">You're considering:</div>
        <div class="price-amount">--</div>
      </div>
      <div class="savings-section">
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

    <!-- Close Button -->
    <button class="debate-close-btn">&times;</button>
  `;
}
