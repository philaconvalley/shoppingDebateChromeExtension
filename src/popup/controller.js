// Popup Controller
console.log('[INFO] Shopping Debate popup loaded - API keys embedded from .env');

const DEFAULT_MODELS = {
  enabler: 'anthropic/claude-3-haiku',
  skeptic: 'anthropic/claude-3.5-sonnet',
  mediator: 'anthropic/claude-3-opus'
};

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

// Load models on popup open
loadModels();
