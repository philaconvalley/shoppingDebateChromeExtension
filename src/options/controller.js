// Options Page Controller

const DEFAULT_MODEL = 'anthropic/claude-3-haiku';

// Load saved settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(['apiKey', 'model']);

  document.getElementById('apiKey').value = result.apiKey || '';
  document.getElementById('model').value = result.model || DEFAULT_MODEL;
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();

  const apiKey = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('model').value;

  // Validate API key format
  if (apiKey && !apiKey.startsWith('sk-or-')) {
    showStatus('Please enter a valid OpenRouter API key (starts with sk-or-)', 'error');
    return;
  }

  // Save to Chrome storage
  await chrome.storage.sync.set({ apiKey, model });

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
