// Popup Controller

import { DEFAULT_MODELS, MESSAGE_TYPES } from '../shared/constants.js';
import { getSyncStorage, setSyncStorage, getLocalStorage, setLocalStorage } from '../shared/storage.js';

console.log('[INFO] Shopping Debate popup loaded - API keys embedded from .env');

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
  const result = await getSyncStorage(['models']);
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

  await setSyncStorage({ models });
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
  chrome.tabs.sendMessage(tab.id, { type: MESSAGE_TYPES.TRIGGER_DEBATE });

  // Close popup
  window.close();
});

// Load and display reminders
async function loadReminders() {
  const reminders = await getLocalStorage(['reminders']).then(result => result.reminders || []);
  const remindersList = document.getElementById('remindersList');

  if (reminders.length === 0) {
    remindersList.innerHTML = '<div class="no-reminders">No reminders set</div>';
    return;
  }

  remindersList.innerHTML = '';

  reminders.forEach((reminder, index) => {
    const reminderItem = document.createElement('div');
    reminderItem.className = 'reminder-item';

    const info = document.createElement('div');
    info.className = 'reminder-info';

    const price = document.createElement('div');
    price.className = 'reminder-price';
    price.textContent = reminder.product?.price || 'Price unknown';

    const title = document.createElement('div');
    title.className = 'reminder-title';
    title.textContent = reminder.product?.title || 'Product';
    title.title = reminder.product?.title || 'Product'; // Tooltip for full title

    const time = document.createElement('div');
    time.className = 'reminder-time';
    const daysUntil = Math.ceil((reminder.remindAt - Date.now()) / (1000 * 60 * 60 * 24));
    time.textContent = daysUntil > 0 ? `Reminder in ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : 'Due now';

    info.appendChild(price);
    info.appendChild(title);
    info.appendChild(time);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'reminder-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteReminder(index));

    reminderItem.appendChild(info);
    reminderItem.appendChild(deleteBtn);
    remindersList.appendChild(reminderItem);
  });
}

// Delete a specific reminder
async function deleteReminder(index) {
  const reminders = await getLocalStorage(['reminders']).then(result => result.reminders || []);
  reminders.splice(index, 1);
  await setLocalStorage({ reminders });
  loadReminders(); // Reload the list
}

// Initialize popup
async function initializePopup() {
  await loadModels();
  await loadReminders();
  await initializeThemeToggle();
}

initializePopup();
