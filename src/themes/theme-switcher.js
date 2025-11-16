/**
 * Lightweight Theme Switcher
 * Applies Regina Mode theme via data attributes
 * Works with existing sidebar UI structure
 */

// Available themes
export const THEMES = {
  DEFAULT: 'default',
  REGINA: 'regina',
  TELENOVELA: 'telenovela',
  WWF: 'wwf',
};

// Character mappings per theme
export const THEME_CHARACTERS = {
  default: {
    enabler: { name: 'The Enabler', icon: '+' },
    skeptic: { name: 'The Skeptic', icon: '?' },
    mediator: { name: 'The Mediator', icon: '=' },
  },
  regina: {
    enabler: { name: 'Regina George', icon: 'R' },
    skeptic: { name: 'Gretchen Wieners', icon: 'G' },
    mediator: { name: 'Karen Smith', icon: 'K' },
  },
  telenovela: {
    enabler: { name: 'Valentina', icon: 'V' },
    skeptic: { name: 'Alejandro', icon: 'A' },
    mediator: { name: 'Isabella', icon: 'I' },
  },
  wwf: {
    enabler: { name: 'The Bulldozer', icon: 'B' },
    skeptic: { name: 'Steel Fist', icon: 'S' },
    mediator: { name: 'Candy Slam', icon: 'C' },
  },
};

/**
 * Get current theme from storage
 */
export async function getCurrentTheme() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['theme'], (result) => {
      resolve(result.theme || THEMES.DEFAULT);
    });
  });
}

/**
 * Save theme to storage
 */
export async function saveTheme(themeId) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ theme: themeId }, resolve);
  });
}

/**
 * Apply theme to document
 */
export function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);

  // Apply dark mode if supported
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme-mode', 'dark');
  }
}

/**
 * Get character config for current theme
 */
export function getCharacterConfig(themeId, personalityType) {
  const theme = THEME_CHARACTERS[themeId] || THEME_CHARACTERS.default;
  return theme[personalityType] || theme.enabler;
}

/**
 * Inject theme stylesheet
 */
export function injectThemeStylesheet(themeId) {
  if (themeId === THEMES.DEFAULT) return;

  // Check if already injected
  const existingLink = document.getElementById(`theme-${themeId}`);
  if (existingLink) {
    console.log(`[ThemeSwitcher] ${themeId} stylesheet already exists`);
    return;
  }

  // Remove other theme stylesheets
  document.querySelectorAll('[id^="theme-"]').forEach(link => {
    console.log(`[ThemeSwitcher] Removing old stylesheet: ${link.id}`);
    link.remove();
  });

  // Inject theme stylesheet
  const link = document.createElement('link');
  link.id = `theme-${themeId}`;
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL(`themes/styles/${themeId}-theme.css`);
  
  // Add error handling
  link.onerror = () => console.error(`[ThemeSwitcher] Failed to load ${themeId} stylesheet`);
  link.onload = () => console.log(`[ThemeSwitcher] Successfully injected ${themeId} theme`);
  
  document.head.appendChild(link);
}

/**
 * Initialize theme on page load
 */
export async function initializeTheme() {
  const theme = await getCurrentTheme();
  applyTheme(theme);
  injectThemeStylesheet(theme);
  return theme;
}
