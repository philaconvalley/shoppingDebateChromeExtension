// Background Service Worker - Handles OpenRouter API streaming
import { OpenRouter } from '@openrouter/sdk';
import { themeEngine } from '../themes/theme-engine.js';

// Build array of development API keys from environment variables
// Concatenate keys directly and filter out any empty ones
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

// Get API keys (embedded from .env only)
async function getApiKeys() {
  // Always use embedded keys from .env
  console.log('[INFO] Retrieving embedded API keys...');
  console.log('[INFO] DEV_API_KEYS available:', DEV_API_KEYS.length);

  if (DEV_API_KEYS.length > 0) {
    return DEV_API_KEYS;
  }

  console.error('[ERROR] No API keys found! Make sure .env file is configured and npm run build was executed.');
  return [];
}

// Get next API key (rotates through available keys)
function getNextKeyIndex(keys) {
  if (keys.length === 0) return -1;

  const index = currentKeyIndex % keys.length;
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;

  return index;
}

// Get selected model from storage
async function getModel() {
  const result = await chrome.storage.sync.get(['model']);
  return result.model || 'anthropic/claude-3-haiku';
}

/**
 * Build dynamic prompt for any personality based on current theme
 * @param {string} personalityId - Personality identifier (e.g., 'regina', 'gretchen', 'karen')
 * @param {Object} productContext - Product information
 * @param {Object} previousResponses - Previous character responses (for mediator role)
 * @returns {string} Formatted prompt
 */
function buildPersonalityPrompt(personalityId, productContext, previousResponses = {}) {
  // Use theme engine to build prompts dynamically
  return themeEngine.buildPrompt(personalityId, productContext, previousResponses);
}

// Stream a single personality's response using OpenRouter SDK
async function streamPersonality(prompt, model, apiKey, tabId, personalityName) {
  const client = new OpenRouter({
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://shopping-debate.extension',
      'X-Title': 'Shopping Debate'
    }
  });

  let fullResponse = '';

  // Signal personality started
  chrome.tabs.sendMessage(tabId, {
    type: 'personalityStart',
    personality: personalityName
  });

  try {
    const stream = await client.chat.send({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      maxTokens: 300
    });

    // Process streaming response
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;

      if (content) {
        fullResponse += content;

        // Send chunk to content script
        chrome.tabs.sendMessage(tabId, {
          type: 'personalityChunk',
          personality: personalityName,
          chunk: content
        });
      }
    }
  } catch (error) {
    console.error(`Error streaming ${personalityName}:`, error);
    throw error;
  }

  // Signal personality completed
  chrome.tabs.sendMessage(tabId, {
    type: 'personalityComplete',
    personality: personalityName
  });

  return fullResponse;
}

// Stream with automatic key rotation and fallback
async function streamPersonalityWithFallback(prompt, model, keys, tabId, personalityName) {
  if (keys.length === 0) {
    throw new Error('No API keys available');
  }

  // Get the next key to try (rotates through keys)
  const primaryIndex = getNextKeyIndex(keys);
  const primaryKey = keys[primaryIndex];

  console.log(`Trying key ${primaryIndex + 1}/${keys.length} for ${personalityName}`);

  try {
    // Try with the primary (rotated) key
    return await streamPersonality(prompt, model, primaryKey, tabId, personalityName);
  } catch (error) {
    console.warn(`Key ${primaryIndex + 1} failed for ${personalityName}, trying fallback...`, error);

    // If we have multiple keys, try the others
    if (keys.length > 1) {
      for (let i = 0; i < keys.length; i++) {
        if (i === primaryIndex) continue; // Skip the one we already tried

        const fallbackKey = keys[i];
        console.log(`Trying fallback key ${i + 1}/${keys.length} for ${personalityName}`);

        try {
          return await streamPersonality(prompt, model, fallbackKey, tabId, personalityName);
        } catch (fallbackError) {
          console.warn(`Fallback key ${i + 1} also failed`, fallbackError);
          // Continue to next key
        }
      }
    }

    // All keys failed
    throw new Error(`All API keys failed for ${personalityName}: ${error.message}`);
  }
}

// Handle streaming debate generation using current theme
async function handleStreamingDebate(productContext, tabId) {
  try {
    const apiKeys = await getApiKeys();
    const model = await getModel();

    if (apiKeys.length === 0) {
      throw new Error('No API keys configured. Please add your OpenRouter API key in settings.');
    }

    console.log(`Using ${apiKeys.length} API key(s) with rotation and fallback`);

    // Ensure theme engine is initialized
    await themeEngine.initialize();

    // Get response order from current theme
    const responseOrder = themeEngine.getResponseOrder();
    const personalities = themeEngine.getPersonalities();

    console.log(`[Theme: ${themeEngine.currentTheme}] Streaming ${responseOrder.length} personalities`);

    // Store responses for mediator context
    const responses = {};

    // Stream each personality in order defined by theme
    for (const personalityId of responseOrder) {
      const personality = personalities.find(p => p.id === personalityId);

      if (!personality) {
        console.error(`Personality not found: ${personalityId}`);
        continue;
      }

      // Build prompt based on role
      let prompt;
      if (personality.role === 'mediator') {
        // Mediator gets previous responses
        prompt = buildPersonalityPrompt(personalityId, productContext, responses);
      } else {
        prompt = buildPersonalityPrompt(personalityId, productContext);
      }

      // Stream this personality
      const response = await streamPersonalityWithFallback(
        prompt,
        model,
        apiKeys,
        tabId,
        personalityId // Use personality ID instead of generic role name
      );

      // Store response for next personality
      responses[personality.role] = response;
    }

    // Signal complete
    chrome.tabs.sendMessage(tabId, {
      type: 'debateComplete'
    });

  } catch (error) {
    console.error('Debate generation error:', error);
    chrome.tabs.sendMessage(tabId, {
      type: 'debateError',
      error: error.message
    });
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'generateDebateStreaming') {
    // Start async debate generation
    handleStreamingDebate(message.productContext, sender.tab.id);
    sendResponse({ status: 'started' });
    return true; // Keep message channel open
  }

  if (message.type === 'testDebate') {
    const testContext = `Product: Test Product
Price: $99.99
URL: ${message.url || 'test-page'}`;

    handleStreamingDebate(testContext, sender.tab.id);
    sendResponse({ status: 'started' });
    return true;
  }
});

console.log('Shopping Debate background service worker loaded');
