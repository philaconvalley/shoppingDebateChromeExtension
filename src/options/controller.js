// Options Page Controller

const DEFAULT_MODELS = {
  enabler: 'anthropic/claude-3-haiku',
  skeptic: 'anthropic/claude-3.5-sonnet',
  mediator: 'anthropic/claude-3-opus'
};

// Load saved settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(['apiKey', 'models']);

  document.getElementById('apiKey').value = result.apiKey || '';

  // Load personality-specific models
  const models = result.models || DEFAULT_MODELS;
  document.getElementById('modelEnabler').value = models.enabler || DEFAULT_MODELS.enabler;
  document.getElementById('modelSkeptic').value = models.skeptic || DEFAULT_MODELS.skeptic;
  document.getElementById('modelMediator').value = models.mediator || DEFAULT_MODELS.mediator;
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();

  const apiKey = document.getElementById('apiKey').value.trim();
  const models = {
    enabler: document.getElementById('modelEnabler').value,
    skeptic: document.getElementById('modelSkeptic').value,
    mediator: document.getElementById('modelMediator').value
  };

  // Validate API key format
  if (apiKey && !apiKey.startsWith('sk-or-')) {
    showStatus('Please enter a valid OpenRouter API key (starts with sk-or-)', 'error');
    return;
  }

  // Save to Chrome storage
  await chrome.storage.sync.set({ apiKey, models });

  showStatus('Settings saved successfully!', 'success');
}

// Reset to defaults
async function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  await chrome.storage.sync.clear();
  await loadSettings();

  showStatus('Settings reset to defaults', 'success');
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type} show`;

  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 3000);
}

// Event listeners
document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('resetBtn').addEventListener('click', resetSettings);

// Load settings on page load
loadSettings();
