// Background Service Worker - Handles OpenRouter API streaming
import { OpenRouter } from '@openrouter/sdk';

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

// Get personality-specific models from storage
async function getModels() {
  const result = await chrome.storage.sync.get(['models']);
  return result.models || {
    enabler: 'anthropic/claude-3-haiku',
    skeptic: 'anthropic/claude-3.5-sonnet',
    mediator: 'anthropic/claude-3-opus'
  };
}

// Build Enabler prompt
function buildEnablerPrompt(productContext) {
  return `You are "The Enabler" - an enthusiastic AI personality who finds genuine value in purchases. You're starting a friendly debate.

Product Context:
${productContext}

Your role: Find the real benefits and create vivid scenarios of how this purchase improves their life. IMPORTANT: Mention the specific price in your first sentence and frame it as valuable. Explain why the price is worth it. Keep your response to 2-3 short paragraphs. Be enthusiastic but authentic. Remember, The Skeptic will respond to your points, so make strong, specific arguments they can engage with.`;
}

// Build Skeptic prompt with Enabler's response
function buildSkepticPrompt(productContext, enablerResponse) {
  return `You are "The Skeptic" - a practical AI personality who questions purchase value.

Product Context:
${productContext}

The Enabler just said:
${enablerResponse}

Your role: Respond directly to The Enabler's points. IMPORTANT: Reference the specific price amount and question if it's truly worth it. Counter their enthusiasm with practical concerns about cost vs value. Suggest cheaper alternatives or point out what else could be bought with that money. Ask if they really need this now. Keep your response to 2-3 short paragraphs. Be conversational and thoughtful, not mean. Start by acknowledging what The Enabler said before presenting your counter-perspective.`;
}

// Build Mediator prompt with context from previous responses
function buildMediatorPrompt(productContext, enablerResponse, skepticResponse) {
  return `You are "The Mediator" - a balanced AI personality who synthesizes perspectives using improv's "Yes, And..." technique. You're concluding a friendly debate.

Product Context:
${productContext}

The Enabler said:
${enablerResponse}

The Skeptic responded:
${skepticResponse}

Your role: You've heard both sides of this conversation. Use "Yes, And..." to build on SPECIFIC points from both The Enabler and The Skeptic. IMPORTANT: Acknowledge the price and help the user evaluate if it aligns with their values and budget. Quote or reference their actual arguments by name ("The Enabler pointed out..." or "The Skeptic raised concerns about..."). Acknowledge the back-and-forth between them. Ask 2-3 insightful questions about timing, budget, and actual need to help the user decide. Keep your response to 2-3 short paragraphs. Be wise, balanced, and conversational.`;
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

// Handle streaming debate generation
async function handleStreamingDebate(productContext, tabId) {
  try {
    const apiKeys = await getApiKeys();
    const models = await getModels();

    if (apiKeys.length === 0) {
      throw new Error('No API keys configured. Please add your OpenRouter API key in settings.');
    }

    console.log(`Using ${apiKeys.length} API key(s) with rotation and fallback`);
    console.log('[INFO] Models:', `Enabler: ${models.enabler}, Skeptic: ${models.skeptic}, Mediator: ${models.mediator}`);

    // Stream Enabler
    const enablerResponse = await streamPersonalityWithFallback(
      buildEnablerPrompt(productContext),
      models.enabler,
      apiKeys,
      tabId,
      'enabler'
    );

    // Stream Skeptic - now responds to Enabler
    const skepticResponse = await streamPersonalityWithFallback(
      buildSkepticPrompt(productContext, enablerResponse),
      models.skeptic,
      apiKeys,
      tabId,
      'skeptic'
    );

    // Stream Mediator with context from both
    await streamPersonalityWithFallback(
      buildMediatorPrompt(productContext, enablerResponse, skepticResponse),
      models.mediator,
      apiKeys,
      tabId,
      'mediator'
    );

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
