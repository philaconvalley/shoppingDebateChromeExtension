// Popup Controller - Theme Selector and Test Button
console.log('[INFO] Shopping Debate popup loaded');

// Theme metadata (hardcoded to avoid import issues in popup context)
const AVAILABLE_THEMES = [
  {
    id: 'regina',
    name: 'Regina Mode',
    description: 'Mean Girls shopping experience',
    icon: '👑',
    enabled: true,
  },
  {
    id: 'telenovela',
    name: 'Telenovela Mode',
    description: 'Dramatic soap opera',
    icon: '🧼',
    enabled: false,
  },
  {
    id: 'wwf',
    name: 'WWF Mode',
    description: 'Wrestling promo',
    icon: '💪',
    enabled: false,
  },
];

/**
 * Load current theme from storage
 */
async function loadCurrentTheme() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['theme'], (result) => {
      resolve(result.theme || 'regina');
    });
  });
}

/**
 * Save theme to storage
 */
async function saveTheme(themeId) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ theme: themeId }, resolve);
  });
}

/**
 * Populate theme options in the UI
 */
async function populateThemeOptions() {
  const themeOptionsContainer = document.getElementById('themeOptions');
  const currentTheme = await loadCurrentTheme();

  themeOptionsContainer.innerHTML = AVAILABLE_THEMES.map((theme) => {
    const isActive = theme.id === currentTheme;
    const isDisabled = !theme.enabled;

    return `
      <div class="theme-option ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}"
           data-theme-id="${theme.id}"
           data-enabled="${theme.enabled}">
        <input type="radio"
               name="theme"
               value="${theme.id}"
               ${isActive ? 'checked' : ''}
               ${isDisabled ? 'disabled' : ''}
               id="theme-${theme.id}">
        <label for="theme-${theme.id}" class="theme-option-label">
          <span class="theme-icon">${theme.icon}</span>
          <span>
            <strong>${theme.name}</strong>
            ${isDisabled ? '<span class="theme-badge">Coming Soon</span>' : ''}
          </span>
        </label>
      </div>
    `;
  }).join('');

  // Add click listeners to enabled theme options
  themeOptionsContainer.querySelectorAll('.theme-option').forEach((option) => {
    const themeId = option.dataset.themeId;
    const isEnabled = option.dataset.enabled === 'true';

    if (isEnabled) {
      option.addEventListener('click', async () => {
        await handleThemeChange(themeId);
      });
    }
  });
}

/**
 * Handle theme change
 */
async function handleThemeChange(themeId) {
  console.log('[ThemeChange] Switching to theme:', themeId);

  // Save theme
  await saveTheme(themeId);

  // Update UI
  document.querySelectorAll('.theme-option').forEach((option) => {
    option.classList.remove('active');
    option.querySelector('input').checked = false;
  });

  const selectedOption = document.querySelector(`[data-theme-id="${themeId}"]`);
  if (selectedOption) {
    selectedOption.classList.add('active');
    selectedOption.querySelector('input').checked = true;
  }

  // Notify background/content scripts of theme change
  chrome.runtime.sendMessage({
    type: 'THEME_CHANGED',
    themeId: themeId,
  }).catch((error) => {
    console.log('[ThemeChange] No listeners, that\'s okay:', error);
  });

  // Also notify any active tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'THEME_CHANGED',
      themeId: themeId,
    }).catch(() => {
      // Ignore errors for tabs without content script
    });
  });

  console.log('[ThemeChange] Theme changed to:', themeId);
}

/**
 * Test debate button handler
 */
document.getElementById('testDebate').addEventListener('click', async () => {
  console.log('[TEST] Test button clicked');

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send message to content script to trigger debate
  chrome.tabs.sendMessage(tab.id, { type: 'triggerDebate' }).catch((error) => {
    console.error('[TEST] Failed to trigger debate:', error);
    alert('Could not trigger debate. Make sure you\'re on a webpage that supports the extension.');
  });

  // Close popup
  window.close();
});

/**
 * Initialize popup
 */
async function initializePopup() {
  await populateThemeOptions();
  console.log('[Popup] Initialized successfully');
}

// Initialize on load
initializePopup();
