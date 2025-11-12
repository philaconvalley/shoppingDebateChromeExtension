/**
 * Theme Engine
 * Handles theme switching, CSS injection, and state management
 */

import { getThemeConfig, DEFAULT_THEME } from './theme-registry.js';

class ThemeEngine {
  constructor() {
    this.currentTheme = DEFAULT_THEME;
    this.themeConfig = null;
    this.initialized = false;
  }

  /**
   * Initialize theme engine with stored or default theme
   */
  async initialize() {
    if (this.initialized) return;

    // Load saved theme from storage or use default
    const savedTheme = await this.loadSavedTheme();
    await this.setTheme(savedTheme || DEFAULT_THEME);

    this.initialized = true;
    console.log(`[ThemeEngine] Initialized with theme: ${this.currentTheme}`);
  }

  /**
   * Load saved theme from chrome.storage
   * @returns {Promise<string|null>} Saved theme ID or null
   */
  async loadSavedTheme() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['theme'], (result) => {
        resolve(result.theme || null);
      });
    });
  }

  /**
   * Save current theme to chrome.storage
   */
  async saveTheme(themeId) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ theme: themeId }, resolve);
    });
  }

  /**
   * Set active theme
   * @param {string} themeId - Theme identifier
   */
  async setTheme(themeId) {
    this.themeConfig = getThemeConfig(themeId);
    this.currentTheme = themeId;

    // Save to storage
    await this.saveTheme(themeId);

    // Apply theme to DOM
    this.applyThemeToDOM();

    console.log(`[ThemeEngine] Theme set to: ${themeId}`);
  }

  /**
   * Apply theme attributes to document
   */
  applyThemeToDOM() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.currentTheme);

      // Apply dark mode if preferred and supported
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (this.themeConfig.ui.darkMode?.enabled) {
          document.documentElement.setAttribute('data-theme-mode', 'dark');
        }
      }
    }
  }

  /**
   * Get current theme configuration
   * @returns {Object} Current theme config
   */
  getConfig() {
    if (!this.themeConfig) {
      this.themeConfig = getThemeConfig(this.currentTheme);
    }
    return this.themeConfig;
  }

  /**
   * Get personalities for current theme
   * @returns {Array} Array of personality configs
   */
  getPersonalities() {
    return this.getConfig().personalities;
  }

  /**
   * Get specific personality by ID
   * @param {string} personalityId - Personality identifier
   * @returns {Object|null} Personality config or null
   */
  getPersonality(personalityId) {
    const personalities = this.getPersonalities();
    return personalities.find(p => p.id === personalityId) || null;
  }

  /**
   * Get UI configuration for current theme
   * @returns {Object} UI configuration
   */
  getUIConfig() {
    return this.getConfig().ui;
  }

  /**
   * Get copy/microcopy for current theme
   * @returns {Object} Copy configuration
   */
  getCopy() {
    return this.getConfig().copy;
  }

  /**
   * Get animation configs for current theme
   * @returns {Object} Animation configuration
   */
  getAnimations() {
    return this.getConfig().animations;
  }

  /**
   * Get behavior configs for current theme
   * @returns {Object} Behavior configuration
   */
  getBehavior() {
    return this.getConfig().behavior;
  }

  /**
   * Get stylesheet filename for current theme
   * @returns {string} CSS filename
   */
  getStylesheet() {
    return this.getConfig().stylesheet;
  }

  /**
   * Inject theme stylesheet into page
   * @param {Document} targetDocument - Document to inject into
   */
  injectStylesheet(targetDocument = document) {
    const stylesheetName = this.getStylesheet();
    const linkId = `theme-stylesheet-${this.currentTheme}`;

    // Remove existing theme stylesheets
    const existingLinks = targetDocument.querySelectorAll('[id^="theme-stylesheet-"]');
    existingLinks.forEach(link => link.remove());

    // Inject new stylesheet
    const link = targetDocument.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(`themes/styles/${stylesheetName}`);
    targetDocument.head.appendChild(link);

    console.log(`[ThemeEngine] Injected stylesheet: ${stylesheetName}`);
  }

  /**
   * Build AI prompt for a personality
   * @param {string} personalityId - Personality identifier
   * @param {Object} productContext - Product information
   * @param {Object} previousResponses - Previous character responses (for mediator)
   * @returns {string} Formatted prompt
   */
  buildPrompt(personalityId, productContext, previousResponses = {}) {
    const personality = this.getPersonality(personalityId);
    if (!personality) {
      console.error(`[ThemeEngine] Personality not found: ${personalityId}`);
      return '';
    }

    const { systemRole, responseTemplate } = personality.prompt;

    // Build the full prompt
    let prompt = systemRole + '\n\n';

    // Call the response template function with context
    if (personality.role === 'mediator') {
      // Mediator gets previous responses
      prompt += responseTemplate(
        productContext,
        previousResponses.enabler || '',
        previousResponses.skeptic || ''
      );
    } else {
      prompt += responseTemplate(productContext);
    }

    return prompt;
  }

  /**
   * Get response order for current theme
   * @returns {Array<string>} Array of personality IDs in order
   */
  getResponseOrder() {
    return this.getBehavior().responseOrder;
  }

  /**
   * Switch to a different theme
   * @param {string} newThemeId - New theme identifier
   */
  async switchTheme(newThemeId) {
    console.log(`[ThemeEngine] Switching theme from ${this.currentTheme} to ${newThemeId}`);
    await this.setTheme(newThemeId);

    // Notify that theme changed (for UI updates)
    this.notifyThemeChange(newThemeId);
  }

  /**
   * Notify listeners of theme change
   * @param {string} themeId - New theme ID
   */
  notifyThemeChange(themeId) {
    const event = new CustomEvent('themeChanged', {
      detail: { themeId, config: this.getConfig() }
    });

    if (typeof document !== 'undefined') {
      document.dispatchEvent(event);
    }

    // Also notify via chrome.runtime messaging for cross-context communication
    chrome.runtime.sendMessage({
      type: 'THEME_CHANGED',
      themeId: themeId,
    }).catch(() => {
      // Ignore errors if no listeners
    });
  }
}

// Export singleton instance
export const themeEngine = new ThemeEngine();

// Auto-initialize on import (for background script)
if (typeof chrome !== 'undefined' && chrome.runtime) {
  themeEngine.initialize().catch(console.error);
}
