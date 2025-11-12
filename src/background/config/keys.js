// API Key Management

// Build array of development API keys from environment variables
const DEV_API_KEYS = [
  process.env.OPENROUTER_API_KEY_PART1 + process.env.OPENROUTER_API_KEY_PART2,
  process.env.OPENROUTER_API_KEY2_PART1 + process.env.OPENROUTER_API_KEY2_PART2
].filter(key => key && key.length > 10 && key.startsWith('sk-or-'));

console.log('[DEBUG] Key initialization:');
console.log('  Key 1 parts:', process.env.OPENROUTER_API_KEY_PART1, '+', process.env.OPENROUTER_API_KEY_PART2?.substring(0, 10) + '...');
console.log('  Key 2 parts:', process.env.OPENROUTER_API_KEY2_PART1, '+', process.env.OPENROUTER_API_KEY2_PART2?.substring(0, 10) + '...');
console.log(`[INFO] Total API keys loaded: ${DEV_API_KEYS.length}`);

if (DEV_API_KEYS.length > 0) {
  console.log('[SUCCESS] Primary API key:', DEV_API_KEYS[0].substring(0, 15) + '...');
  if (DEV_API_KEYS.length > 1) {
    console.log('[SUCCESS] Secondary API key:', DEV_API_KEYS[1].substring(0, 15) + '...');
  }
}

// Key rotation state
let currentKeyIndex = 0;

/**
 * Get API keys (embedded from .env only)
 * @returns {Promise<string[]>} - Array of API keys
 */
export async function getApiKeys() {
  console.log('[INFO] Retrieving embedded API keys...');
  console.log('[INFO] DEV_API_KEYS available:', DEV_API_KEYS.length);

  if (DEV_API_KEYS.length > 0) {
    return DEV_API_KEYS;
  }

  console.error('[ERROR] No API keys found! Make sure .env file is configured and npm run build was executed.');
  return [];
}

/**
 * Get next API key (rotates through available keys)
 * @param {string[]} keys - Array of API keys
 * @returns {number} - Index of next key
 */
export function getNextKeyIndex(keys) {
  if (keys.length === 0) return -1;

  const index = currentKeyIndex % keys.length;
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;

  return index;
}
