// Audio Generation Service using ElevenLabs API

import { PERSONALITY_VOICES } from '../../shared/constants.js';

// Get ElevenLabs API key from environment
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

/**
 * Generate speech audio from text using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @param {string} personality - Personality name (enabler, skeptic, mediator)
 * @param {number} speedMultiplier - Global speed multiplier from settings
 * @param {string} apiKey - Optional ElevenLabs API key (defaults to env key)
 * @returns {Promise<string>} - Base64 encoded audio data
 */
export async function generateSpeech(text, personality, speedMultiplier = 1.0, apiKey = null) {
  // Use provided API key or fall back to environment key
  const elevenlabsKey = apiKey || ELEVENLABS_API_KEY;

  if (!elevenlabsKey || elevenlabsKey.length < 10) {
    console.warn('[Audio] No ElevenLabs API key configured');
    return null;
  }

  const voiceConfig = PERSONALITY_VOICES[personality];
  if (!voiceConfig) {
    console.error(`[Audio] Unknown personality: ${personality}`);
    return null;
  }

  console.log(`[Audio] Generating speech for ${personality}:`, {
    voice_id: voiceConfig.voiceId,
    textLength: text.length,
    hasApiKey: !!elevenlabsKey
  });

  try {
    // Call ElevenLabs Text-to-Speech API
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`;

    console.log(`[Audio] Calling ElevenLabs API: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    console.log(`[Audio] ElevenLabs API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Audio] ElevenLabs API error: ${response.status}`, errorText);
      return null;
    }

    // Get audio as blob
    const audioBlob = await response.blob();
    console.log(`[Audio] Audio blob size: ${audioBlob.size} bytes`);

    // Convert to base64
    const base64Audio = await blobToBase64(audioBlob);
    console.log(`[Audio] Generated base64 audio (${base64Audio.length} chars) for ${personality}`);

    return base64Audio;

  } catch (error) {
    console.error('[Audio] Speech generation error:', error);
    console.error('[Audio] Error details:', {
      message: error.message,
      voice_id: voiceConfig.voiceId,
      textPreview: text.substring(0, 50)
    });
    return null;
  }
}

/**
 * Convert blob to base64 data URL
 * @param {Blob} blob - Audio blob
 * @returns {Promise<string>} - Base64 data URL
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Extract complete sentences from text buffer
 * @param {string} text - Text buffer
 * @returns {{complete: string[], remaining: string}}
 */
export function extractCompleteSentences(text) {
  // Match sentences ending with . ! or ? followed by space or end of string
  const sentenceRegex = /[^.!?]+[.!?]+(?:\s|$)/g;
  const matches = text.match(sentenceRegex) || [];

  const complete = matches.map(s => s.trim()).filter(s => s.length > 0);
  const consumedLength = matches.join('').length;
  const remaining = text.substring(consumedLength);

  return { complete, remaining };
}
