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
