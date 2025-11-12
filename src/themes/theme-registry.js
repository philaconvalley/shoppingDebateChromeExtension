/**
 * Theme Registry
 * Central registry for all drama modes/themes
 * Each theme defines personalities, visual styles, and behavioral configs
 */

import { reginaConfig } from './configs/regina-config.js';
import { telenovelaConfig } from './configs/telenovela-config.js';
import { wwfConfig } from './configs/wwf-config.js';

export const THEME_REGISTRY = {
  regina: reginaConfig,
  telenovela: telenovelaConfig,
  wwf: wwfConfig,
};

export const DEFAULT_THEME = 'regina';

/**
 * Get theme configuration by ID
 * @param {string} themeId - Theme identifier (e.g., 'regina', 'telenovela')
 * @returns {Object} Theme configuration object
 */
export function getThemeConfig(themeId) {
  const theme = THEME_REGISTRY[themeId];
  if (!theme) {
    console.warn(`Theme "${themeId}" not found, falling back to default`);
    return THEME_REGISTRY[DEFAULT_THEME];
  }
  return theme;
}

/**
 * Get all available themes for UI selection
 * @returns {Array} Array of theme metadata objects
 */
export function getAvailableThemes() {
  return Object.keys(THEME_REGISTRY).map(themeId => ({
    id: themeId,
    name: THEME_REGISTRY[themeId].metadata.name,
    description: THEME_REGISTRY[themeId].metadata.description,
    icon: THEME_REGISTRY[themeId].metadata.icon,
    enabled: THEME_REGISTRY[themeId].metadata.enabled,
  })).filter(theme => theme.enabled);
}

/**
 * Validate theme configuration structure
 * @param {Object} config - Theme config to validate
 * @returns {boolean} True if valid
 */
export function validateThemeConfig(config) {
  const required = ['metadata', 'personalities', 'ui', 'copy'];
  return required.every(key => key in config);
}
