// OpenRouter API Client

import { OpenRouter } from '@openrouter/sdk';
import { generateSpeech, extractCompleteSentences } from '../services/audio.js';
import { AUDIO_MESSAGE_TYPES } from '../../shared/constants.js';
import { getSyncStorage } from '../../shared/storage.js';

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
  let sentenceBuffer = '';

  // Load voice settings
  const settings = await getSyncStorage(['enableVoice', 'voiceSpeed', 'elevenlabsApiKey']);
  const enableVoice = settings.enableVoice !== undefined ? settings.enableVoice : true;
  const voiceSpeed = settings.voiceSpeed !== undefined ? settings.voiceSpeed : 1.0;
  const elevenlabsApiKey = settings.elevenlabsApiKey || null;

  console.log(`[Audio Pipeline] Voice settings loaded for ${personalityName}:`, {
    enableVoice,
    voiceSpeed,
    hasApiKey: !!elevenlabsApiKey,
    apiKeySource: elevenlabsApiKey ? 'user-settings' : 'environment'
  });

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
        sentenceBuffer += content;

        // Send text chunk to content script for display
        chrome.tabs.sendMessage(tabId, {
          type: 'personalityChunk',
          personality: personalityName,
          chunk: content
        });

        // Check if we have complete sentences
        const { complete, remaining } = extractCompleteSentences(sentenceBuffer);

        // Generate audio for each complete sentence (if voice is enabled)
        if (enableVoice) {
          for (const sentence of complete) {
            console.log(`[Audio] Generating audio for sentence: "${sentence.substring(0, 50)}..."`);

            // Generate speech audio (runs in parallel with streaming)
            generateSpeech(sentence, personalityName, voiceSpeed, elevenlabsApiKey).then(audioData => {
              if (audioData) {
                // Send audio data to content script
                chrome.tabs.sendMessage(tabId, {
                  type: AUDIO_MESSAGE_TYPES.PERSONALITY_AUDIO,
                  personality: personalityName,
                  audioData: audioData,
                  sentence: sentence
                });
              }
            }).catch(error => {
              console.error(`[Audio] Failed to generate audio for ${personalityName}:`, error);
            });
          }
        }

        // Update buffer with remaining incomplete text
        sentenceBuffer = remaining;
      }
    }

    // Handle any remaining text in buffer at the end (if voice is enabled)
    if (enableVoice && sentenceBuffer.trim().length > 0) {
      console.log(`[Audio] Generating audio for final fragment: "${sentenceBuffer.substring(0, 50)}..."`);

      generateSpeech(sentenceBuffer, personalityName, voiceSpeed, elevenlabsApiKey).then(audioData => {
        if (audioData) {
          chrome.tabs.sendMessage(tabId, {
            type: AUDIO_MESSAGE_TYPES.PERSONALITY_AUDIO,
            personality: personalityName,
            audioData: audioData,
            sentence: sentenceBuffer
          });
        }

        // Signal audio generation complete
        chrome.tabs.sendMessage(tabId, {
          type: AUDIO_MESSAGE_TYPES.PERSONALITY_AUDIO_COMPLETE,
          personality: personalityName
        });
      }).catch(error => {
        console.error(`[Audio] Failed to generate final audio for ${personalityName}:`, error);
      });
    } else {
      // Signal audio generation complete even if no remaining text or voice disabled
      chrome.tabs.sendMessage(tabId, {
        type: AUDIO_MESSAGE_TYPES.PERSONALITY_AUDIO_COMPLETE,
        personality: personalityName
      });
    }

  } catch (error) {
    console.error(`Error streaming ${personalityName}:`, error);
    throw error;
  }

  // Signal personality text completed
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
