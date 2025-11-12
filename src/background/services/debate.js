// Debate Orchestration Service

import { getModels } from '../../shared/storage.js';
import { DEFAULT_MODELS, PERSONALITIES, MESSAGE_TYPES } from '../../shared/constants.js';
import { streamPersonalityWithFallback } from '../api/openrouter.js';
import { buildEnablerPrompt, buildSkepticPrompt, buildMediatorPrompt } from '../api/prompts.js';

/**
 * Handle streaming debate generation
 * @param {string} productContext - Product context information
 * @param {number} tabId - Chrome tab ID
 * @param {string[]} apiKeys - Array of API keys
 * @param {Function} getNextKeyIndex - Function to get next key index
 */
export async function handleStreamingDebate(productContext, tabId, apiKeys, getNextKeyIndex) {
  try {
    const models = await getModels() || DEFAULT_MODELS;

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
      PERSONALITIES.ENABLER,
      getNextKeyIndex
    );

    // Stream Skeptic - now responds to Enabler
    const skepticResponse = await streamPersonalityWithFallback(
      buildSkepticPrompt(productContext, enablerResponse),
      models.skeptic,
      apiKeys,
      tabId,
      PERSONALITIES.SKEPTIC,
      getNextKeyIndex
    );

    // Stream Mediator with context from both
    await streamPersonalityWithFallback(
      buildMediatorPrompt(productContext, enablerResponse, skepticResponse),
      models.mediator,
      apiKeys,
      tabId,
      PERSONALITIES.MEDIATOR,
      getNextKeyIndex
    );

    // Signal complete
    chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.DEBATE_COMPLETE
    });

  } catch (error) {
    console.error('Debate generation error:', error);
    chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.DEBATE_ERROR,
      error: error.message
    });
  }
}
