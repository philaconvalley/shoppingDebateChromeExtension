/**
 * Theme Configuration Registry
 * Centralized theme settings with accessibility compliance
 */

export const THEME_CONFIG = {
  regina: {
    id: 'regina',
    name: 'Regina Mode',
    enabled: true,
    layout: 'sidebar',
    soundToggle: true,

    // Typography & Accessibility - DARK MODE
    text: {
      base: '#FFFFFF',        // White text on dark background
      accent: '#FF69B4',      // Hot pink - Use sparingly for emphasis only
      background: '#2D1B2E',  // Deep purple-black background - WCAG AAA compliant
      secondary: '#FFB6D9',   // Light pink for secondary text
      contrastFix: true       // Accessibility mode enabled
    },

    // Color Palette
    colors: {
      // Primary Regina Pink (for backgrounds, borders, non-text elements)
      primary: 'linear-gradient(135deg, #FFB6D9 0%, #FF69B4 50%, #FF1493 100%)',
      primaryLight: '#FFE4F0',
      primaryMedium: '#FFB6D9',
      primaryHot: '#FF69B4',
      primaryDeep: '#FF1493',
      primaryBurn: '#C71585',  // Darkest pink - 5.1:1 contrast (WCAG AA compliant)

      // The Plastics Gold
      gold: '#FFD700',
      goldLight: '#FFF8DC',

      // Supporting Cast
      gretchen: 'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)',
      gretchenBorder: '#BA55D3',
      karen: 'linear-gradient(135deg, #FFE4E1 0%, #FFC0CB 100%)',
      karenBorder: '#FFC0CB',

      // Functional
      success: '#2E7D32',     // Darker green (4.5:1 contrast)
      error: '#C62828',       // Darker red (6.2:1 contrast)
      shadow: 'rgba(255, 20, 147, 0.15)',
    },

    // Typography
    fonts: {
      headline: "'Playfair Display', Georgia, serif",
      body: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      accent: "'Archivo Black', Impact, sans-serif",
    },

    // Character Mapping
    characters: {
      enabler: {
        id: 'regina',
        name: 'Regina George',
        icon: 'R',
        gradient: 'linear-gradient(135deg, #FFB6D9 0%, #FF69B4 100%)',
        borderColor: '#FFD700',
        textColor: '#2D1B2E',     // High contrast for readability
        accentColor: '#FF69B4',   // For emphasis only
      },
      skeptic: {
        id: 'gretchen',
        name: 'Gretchen Wieners',
        icon: 'G',
        gradient: 'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)',
        borderColor: '#BA55D3',
        textColor: '#2D1B2E',
        accentColor: '#BA55D3',
      },
      mediator: {
        id: 'karen',
        name: 'Karen Smith',
        icon: 'K',
        gradient: 'linear-gradient(135deg, #FFE4E1 0%, #FFC0CB 100%)',
        borderColor: '#FFC0CB',
        textColor: '#2D1B2E',
        accentColor: '#FFC0CB',
      },
    },

    // Microcopy
    copy: {
      buttons: {
        proceed: "That's So Fetch!",
        reconsider: "Whatever",
        remind: "Remind Me Later",
      },
      labels: {
        savings: "This Month's Wins",
        price: "You're considering:",
      },
    },
  },

  telenovela: {
    id: 'telenovela',
    name: 'Telenovela Mode',
    enabled: true,
    layout: 'sidebar',
    soundToggle: true,

    text: {
      base: '#FFFFFF',        // White text on dark background
      accent: '#FFD1DC',      // Light pink - emphasis
      background: '#3B1A21',  // Wine red background - WCAG AAA compliant
      secondary: '#FFC0CB',   // Soft pink for secondary text
      contrastFix: true
    },

    colors: {
      primary: 'linear-gradient(135deg, #C9A04D 0%, #B8860B 100%)',
      crimson: '#DC143C',
      gold: '#DAA520',
      candlelight: '#FFA500',
    },

    fonts: {
      headline: "'Playfair Display', 'Crimson Text', Georgia, serif",
      body: "'Crimson Text', 'Libre Baskerville', Georgia, serif",
      accent: "'Cinzel', 'Playfair Display', serif",
    },

    characters: {
      enabler: {
        id: 'valentina',
        name: 'Valentina',
        icon: 'V',
        gradient: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)',
        borderColor: '#DC143C',
        textColor: '#1A0000',
        accentColor: '#FF1744',
      },
      skeptic: {
        id: 'alejandro',
        name: 'Alejandro',
        icon: 'A',
        gradient: 'linear-gradient(135deg, #4B0082 0%, #2E0854 100%)',
        borderColor: '#4B0082',
        textColor: '#1A0000',
        accentColor: '#6A1B9A',
      },
      mediator: {
        id: 'isabella',
        name: 'Isabella',
        icon: 'I',
        gradient: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
        borderColor: '#DAA520',
        textColor: '#1A0000',
        accentColor: '#FFD700',
      },
    },

    copy: {
      buttons: {
        proceed: "¡Sí, Mi Amor!",
        reconsider: "¡No Puede Ser!",
        remind: "Más Tarde",
      },
      labels: {
        savings: "Este Mes",
        price: "El Precio del Amor:",
      },
    },

    sounds: {
      entrance: 'dun-dun-dunn.mp3',
      gasp: 'gasp.mp3',
      violin: 'violin-loop.mp3',
      slap: 'slap.mp3',
    },
  },

  wwf: {
    id: 'wwf',
    name: 'WWF Mode',
    enabled: true,
    layout: 'sidebar',
    soundToggle: true,

    text: {
      base: '#FFFFFF',        // White on black - 21:1 contrast (AAA)
      accent: '#FF4040',      // Red accent
      background: '#1A1A1A',  // Dark gray background
      secondary: '#FFD700',   // Gold - 10.4:1 contrast
      contrastFix: true
    },

    colors: {
      primary: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      gold: '#FFD700',
      neonGreen: '#00FF00',
      neonBlue: '#00FFFF',
      ringRed: '#8B0000',
    },

    fonts: {
      headline: "'Impact', 'Archivo Black', 'Arial Black', sans-serif",
      body: "'Roboto Condensed', 'Arial Narrow', sans-serif",
      accent: "'Impact', sans-serif",
    },

    characters: {
      enabler: {
        id: 'bulldozer',
        name: 'The Bulldozer',
        icon: 'B',
        gradient: 'linear-gradient(135deg, #FF4500 0%, #8B0000 100%)',
        borderColor: '#FF4500',
        textColor: '#FFFFFF',
        accentColor: '#FF6347',
      },
      skeptic: {
        id: 'steelfist',
        name: 'Steel Fist',
        icon: 'S',
        gradient: 'linear-gradient(135deg, #1E90FF 0%, #00008B 100%)',
        borderColor: '#1E90FF',
        textColor: '#FFFFFF',
        accentColor: '#4169E1',
      },
      mediator: {
        id: 'candyslam',
        name: 'Candy Slam',
        icon: 'C',
        gradient: 'linear-gradient(135deg, #FF1493 0%, #8B008B 100%)',
        borderColor: '#FF1493',
        textColor: '#FFFFFF',
        accentColor: '#FF69B4',
      },
    },

    copy: {
      buttons: {
        proceed: "AND THAT'S THE BOTTOM LINE!",
        reconsider: "TAP OUT!",
        remind: "Ring the Bell Later",
      },
      labels: {
        savings: "CHAMPIONSHIP STATS",
        price: "IN THE RING:",
      },
    },

    sounds: {
      entrance: 'glass-shatter.mp3',
      bodyslam: 'slam.mp3',
      bell: 'ring-bell.mp3',
      crowd: 'crowd-roar.mp3',
    },
  },

  default: {
    id: 'default',
    name: 'Default',
    enabled: true,
    layout: 'sidebar',
    soundToggle: false,

    text: {
      base: '#1f2937',
      accent: '#667eea',
      background: '#FFFFFF',
      secondary: '#6b7280',
      contrastFix: true
    },

    characters: {
      enabler: { name: 'The Enabler', icon: '+' },
      skeptic: { name: 'The Skeptic', icon: '?' },
      mediator: { name: 'The Mediator', icon: '=' },
    },
  },
};

/**
 * Get theme configuration by ID
 */
export function getThemeConfig(themeId) {
  return THEME_CONFIG[themeId] || THEME_CONFIG.default;
}

/**
 * Get character config for a theme
 */
export function getCharacterConfig(themeId, roleId) {
  const theme = getThemeConfig(themeId);
  return theme.characters?.[roleId] || theme.characters?.enabler;
}
