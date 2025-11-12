// Chrome Storage Wrapper

/**
 * Get items from Chrome sync storage
 * @param {string[]} keys - Keys to retrieve
 * @returns {Promise<object>} - Storage data
 */
export async function getSyncStorage(keys) {
  return await chrome.storage.sync.get(keys);
}

/**
 * Set items in Chrome sync storage
 * @param {object} data - Data to store
 * @returns {Promise<void>}
 */
export async function setSyncStorage(data) {
  return await chrome.storage.sync.set(data);
}

/**
 * Get items from Chrome local storage
 * @param {string[]} keys - Keys to retrieve
 * @returns {Promise<object>} - Storage data
 */
export async function getLocalStorage(keys) {
  return await chrome.storage.local.get(keys);
}

/**
 * Set items in Chrome local storage
 * @param {object} data - Data to store
 * @returns {Promise<void>}
 */
export async function setLocalStorage(data) {
  return await chrome.storage.local.set(data);
}

/**
 * Clear all sync storage
 * @returns {Promise<void>}
 */
export async function clearSyncStorage() {
  return await chrome.storage.sync.clear();
}

/**
 * Get API keys from sync storage
 * @returns {Promise<string[]>} - Array of API keys
 */
export async function getApiKeys() {
  const result = await getSyncStorage(['apiKey']);
  const keys = [];

  if (result.apiKey) {
    keys.push(result.apiKey);
  }

  return keys;
}

/**
 * Get models configuration from sync storage
 * @returns {Promise<object>} - Models configuration
 */
export async function getModels() {
  const result = await getSyncStorage(['models']);
  return result.models || null;
}

/**
 * Get price threshold from sync storage
 * @returns {Promise<number>} - Price threshold
 */
export async function getPriceThreshold() {
  const result = await getSyncStorage(['priceThreshold']);
  return result.priceThreshold;
}

/**
 * Get reminders from local storage
 * @returns {Promise<Array>} - Array of reminders
 */
export async function getReminders() {
  const result = await getLocalStorage(['reminders']);
  return result.reminders || [];
}

/**
 * Set reminders in local storage
 * @param {Array} reminders - Array of reminder objects
 * @returns {Promise<void>}
 */
export async function setReminders(reminders) {
  return await setLocalStorage({ reminders });
}

/**
 * Get savings data from local storage
 * @returns {Promise<object>} - Savings data by month
 */
export async function getSavings() {
  const result = await getLocalStorage(['savings']);
  return result.savings || {};
}

/**
 * Set savings data in local storage
 * @param {object} savings - Savings data by month
 * @returns {Promise<void>}
 */
export async function setSavings(savings) {
  return await setLocalStorage({ savings });
}
