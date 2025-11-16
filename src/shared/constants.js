// Shared Constants

// Default AI models for each personality
export const DEFAULT_MODELS = {
  enabler: 'anthropic/claude-3-haiku',
  skeptic: 'anthropic/claude-3.5-sonnet',
  mediator: 'anthropic/claude-3-opus'
};

// Default settings
export const DEFAULT_PRICE_THRESHOLD = 50;

// Reminder duration (3 days in milliseconds)
export const REMINDER_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

// Reminder check interval (60 minutes)
export const REMINDER_CHECK_INTERVAL = 60;

// Personality types
export const PERSONALITIES = {
  ENABLER: 'enabler',
  SKEPTIC: 'skeptic',
  MEDIATOR: 'mediator'
};

// Message types
export const MESSAGE_TYPES = {
  GENERATE_DEBATE_STREAMING: 'generateDebateStreaming',
  PERSONALITY_START: 'personalityStart',
  PERSONALITY_CHUNK: 'personalityChunk',
  PERSONALITY_COMPLETE: 'personalityComplete',
  DEBATE_COMPLETE: 'debateComplete',
  DEBATE_ERROR: 'debateError',
  TRIGGER_DEBATE: 'triggerDebate',
  TEST_DEBATE: 'testDebate'
};

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  ERROR: 'error'
};

// Checkout URL patterns
export const CHECKOUT_PATTERNS = [
  /checkout/i,
  /cart/i,
  /basket/i,
  /payment/i,
  /billing/i,
  /order/i,
  /purchase/i,
  /pay/i
];

// Voice configuration for each personality by theme (ElevenLabs)
export const THEME_VOICES = {
  default: {
    enabler: {
      voiceId: 'pNInz6obpgDQGcFmaJgB',  // Adam - Warm, enthusiastic
      speed: 1.1
    },
    skeptic: {
      voiceId: 'ErXwobaYiN019PkySvjV',  // Antoni - Measured, thoughtful
      speed: 0.95
    },
    mediator: {
      voiceId: 'VR6AewLTigWG4xSOukaG',  // Arnold - Balanced, calm
      speed: 1.0
    }
  },
  regina: {
    enabler: {
      voiceId: '21m00Tcm4TlvDq8ikWAM',  // Rachel - Sassy, confident (Regina George)
      speed: 1.2
    },
    skeptic: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL',  // Bella - Nervous, excited (Gretchen)
      speed: 1.0
    },
    mediator: {
      voiceId: 'MF3mGyEYCl7XYWbV9V6O',  // Elli - Sweet, ditzy (Karen)
      speed: 0.95
    }
  },
  telenovela: {
    enabler: {
      voiceId: 'ThT5KcBeYPX3keUQqHPh',  // Dorothy - Dramatic, passionate (Valentina)
      speed: 1.0
    },
    skeptic: {
      voiceId: 'onwK4e9ZLuTAKqWW03F9',  // Daniel - Deep, brooding (Alejandro)
      speed: 0.9
    },
    mediator: {
      voiceId: 'XB0fDUnXU5powFXDhCwa',  // Charlotte - Warm, maternal (Isabella)
      speed: 1.0
    }
  },
  wwf: {
    enabler: {
      voiceId: 'TxGEqnHWrfWFTfGW9XjX',  // Josh - Powerful, aggressive (Bulldozer)
      speed: 1.3
    },
    skeptic: {
      voiceId: 'VR6AewLTigWG4xSOukaG',  // Arnold - Strong, commanding (Steel Fist)
      speed: 1.1
    },
    mediator: {
      voiceId: 'jsCqWAovK2LkecY7zXl4',  // Freya - Fierce, energetic (Candy Slam)
      speed: 1.2
    }
  }
};

// Legacy - defaults to 'default' theme
export const PERSONALITY_VOICES = THEME_VOICES.default;

// Audio message types
export const AUDIO_MESSAGE_TYPES = {
  PERSONALITY_AUDIO: 'personalityAudio',
  PERSONALITY_SPEAKING: 'personalitySpeaking',
  PERSONALITY_AUDIO_COMPLETE: 'personalityAudioComplete'
};
