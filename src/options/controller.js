// Options Page Controller

import { DEFAULT_MODELS, DEFAULT_PRICE_THRESHOLD } from '../shared/constants.js';
import { getSyncStorage, setSyncStorage, clearSyncStorage } from '../shared/storage.js';

// Load saved settings
async function loadSettings() {
  const result = await getSyncStorage(['apiKey', 'models', 'priceThreshold', 'elevenlabsApiKey', 'enableVoice', 'voiceSpeed']);

  document.getElementById('apiKey').value = result.apiKey || '';
  document.getElementById('priceThreshold').value = result.priceThreshold !== undefined ? result.priceThreshold : DEFAULT_PRICE_THRESHOLD;

  // Load voice settings
  document.getElementById('elevenlabsApiKey').value = result.elevenlabsApiKey || '';
  document.getElementById('enableVoice').checked = result.enableVoice !== undefined ? result.enableVoice : true;
  const voiceSpeed = result.voiceSpeed !== undefined ? result.voiceSpeed : 1.0;
  document.getElementById('voiceSpeed').value = voiceSpeed;
  document.getElementById('voiceSpeedValue').textContent = voiceSpeed.toFixed(1) + 'x';

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
  const priceThreshold = parseFloat(document.getElementById('priceThreshold').value) || 0;
  const elevenlabsApiKey = document.getElementById('elevenlabsApiKey').value.trim();
  const enableVoice = document.getElementById('enableVoice').checked;
  const voiceSpeed = parseFloat(document.getElementById('voiceSpeed').value);
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

  // Validate price threshold
  if (priceThreshold < 0) {
    showStatus('Price threshold must be 0 or greater', 'error');
    return;
  }

  // Validate voice speed
  if (voiceSpeed < 0.5 || voiceSpeed > 2.0) {
    showStatus('Voice speed must be between 0.5x and 2.0x', 'error');
    return;
  }

  // Save to Chrome storage
  await setSyncStorage({ apiKey, models, priceThreshold, elevenlabsApiKey, enableVoice, voiceSpeed });

  showStatus('Settings saved successfully!', 'success');
}

// Reset to defaults
async function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  await clearSyncStorage();
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

// Update voice speed display when slider changes
function updateVoiceSpeedDisplay() {
  const voiceSpeed = parseFloat(document.getElementById('voiceSpeed').value);
  document.getElementById('voiceSpeedValue').textContent = voiceSpeed.toFixed(1) + 'x';
}

// Event listeners
document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('resetBtn').addEventListener('click', resetSettings);
document.getElementById('voiceSpeed').addEventListener('input', updateVoiceSpeedDisplay);

// Load settings on page load
loadSettings();
