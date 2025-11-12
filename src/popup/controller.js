// Popup Controller
console.log('[INFO] Shopping Debate popup loaded - API keys embedded from .env');

const DEFAULT_MODELS = {
  enabler: 'anthropic/claude-3-haiku',
  skeptic: 'anthropic/claude-3.5-sonnet',
  mediator: 'anthropic/claude-3-opus'
};

// Theme management
async function getCurrentTheme() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['theme'], (result) => {
      resolve(result.theme || 'default');
    });
  });
}

async function saveTheme(themeId) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ theme: themeId }, resolve);
  });
}

// Initialize theme toggle
async function initializeThemeToggle() {
  const currentTheme = await getCurrentTheme();

  // Set active state
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === currentTheme) {
      btn.classList.add('active');
    }
  });

  // Add click listeners
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const themeId = btn.dataset.theme;

      // Update UI
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Save theme
      await saveTheme(themeId);
      console.log(`[Theme] Switched to: ${themeId}`);

      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'THEME_CHANGED',
          themeId: themeId
        }).catch(() => {
          // Ignore errors for tabs without content script
        });
      });
    });
  });
}

// Load current model selections
async function loadModels() {
  const result = await chrome.storage.sync.get(['models']);
  const models = result.models || DEFAULT_MODELS;

  document.getElementById('quickModelEnabler').value = models.enabler;
  document.getElementById('quickModelSkeptic').value = models.skeptic;
  document.getElementById('quickModelMediator').value = models.mediator;
}

// Save model when changed
async function saveModelChange() {
  const models = {
    enabler: document.getElementById('quickModelEnabler').value,
    skeptic: document.getElementById('quickModelSkeptic').value,
    mediator: document.getElementById('quickModelMediator').value
  };

  await chrome.storage.sync.set({ models });
  console.log('[INFO] Models updated:', models);
}

// Event listeners for model changes
document.getElementById('quickModelEnabler').addEventListener('change', saveModelChange);
document.getElementById('quickModelSkeptic').addEventListener('change', saveModelChange);
document.getElementById('quickModelMediator').addEventListener('change', saveModelChange);

// Open settings page
document.getElementById('openSettings').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Test debate button
document.getElementById('testDebate').addEventListener('click', async () => {
  console.log('[TEST] Test button clicked');

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send message to content script to trigger debate
  chrome.tabs.sendMessage(tab.id, { type: 'triggerDebate' });

  // Close popup
  window.close();
});

// Initialize popup
async function initializePopup() {
  await loadModels();
  await initializeThemeToggle();
}

initializePopup();
