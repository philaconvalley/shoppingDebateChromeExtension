// Popup Controller
console.log('[INFO] Shopping Debate popup loaded - API keys embedded from .env');

document.getElementById('testDebate').addEventListener('click', async () => {
  console.log('[TEST] Test button clicked');

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send message to content script to trigger debate
  chrome.tabs.sendMessage(tab.id, { type: 'triggerDebate' });

  // Close popup
  window.close();
});
