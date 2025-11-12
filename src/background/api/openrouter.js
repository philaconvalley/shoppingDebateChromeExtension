// OpenRouter API Client

import { OpenRouter } from '@openrouter/sdk';

/**
 * Stream a single personality's response using OpenRouter SDK
 * @param {string} prompt - Prompt for the AI
 * @param {string} model - Model ID to use
 * @param {string} apiKey - API key for authentication
 * @param {number} tabId - Chrome tab ID to send messages to
 * @param {string} personalityName - Name of the personality
 * @returns {Promise<string>} - Full response text
 */
export async function streamPersonality(prompt, model, apiKey, tabId, personalityName) {
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

/**
 * Stream with automatic key rotation and fallback
 * @param {string} prompt - Prompt for the AI
 * @param {string} model - Model ID to use
 * @param {string[]} keys - Array of API keys
 * @param {number} tabId - Chrome tab ID
 * @param {string} personalityName - Name of the personality
 * @param {Function} getNextKeyIndex - Function to get next key index
 * @returns {Promise<string>} - Full response text
 */
export async function streamPersonalityWithFallback(prompt, model, keys, tabId, personalityName, getNextKeyIndex) {
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
