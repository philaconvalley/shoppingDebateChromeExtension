/**
 * WWF Mode - Wrestling Match Promo
 * "Items as wrestling props/weapons" themed shopping experience
 *
 * 💪 STUB CONFIG - To be fully designed and implemented
 */

export const wwfConfig = {
  metadata: {
    id: 'wwf',
    name: 'WWF Mode',
    description: 'Wrestling promo trash talk - your cart items become weapons and props',
    icon: '💪',
    enabled: false, // Not yet implemented
    version: '0.1.0',
  },

  personalities: [
    {
      id: 'the-champion',
      name: 'The Champ',
      role: 'enabler',
      icon: '🏆',
      description: 'The reigning champion - over-the-top confidence',

      ui: {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        borderColor: '#FFD700',
        accentColor: '#FF4500',
        cardSize: 'large',
        position: 'center',
      },

      prompt: {
        systemRole: 'You are an over-the-top wrestling champion cutting a promo. Every product is a weapon or prop in your championship reign. STUB: Full personality to be developed.',
        responseTemplate: (productContext) => `[WWF STUB] Championship promo about ${productContext.productName}`,
      },
    },

    {
      id: 'the-heel',
      name: 'The Villain',
      role: 'skeptic',
      icon: '😈',
      description: 'The villainous heel - trash-talking skeptic',

      ui: {
        gradient: 'linear-gradient(135deg, #000000 0%, #4B0082 100%)',
        borderColor: '#4B0082',
        accentColor: '#8B0000',
        cardSize: 'medium',
        position: 'left',
      },

      prompt: {
        systemRole: 'You are the villainous heel wrestler. You trash-talk everything and question the champion. STUB: Full personality to be developed.',
        responseTemplate: (productContext) => `[WWF STUB] Heel promo about ${productContext.productName}`,
      },
    },

    {
      id: 'the-ref',
      name: 'The Referee',
      role: 'mediator',
      icon: '👨‍⚖️',
      description: 'The referee - tries to maintain order',

      ui: {
        gradient: 'linear-gradient(135deg, #FFFFFF 0%, #C0C0C0 100%)',
        borderColor: '#000000',
        accentColor: '#FFD700',
        cardSize: 'medium',
        position: 'right',
      },

      prompt: {
        systemRole: 'You are the wrestling referee trying to mediate between these larger-than-life personalities. STUB: Full personality to be developed.',
        responseTemplate: (productContext) => `[WWF STUB] Referee decision about ${productContext.productName}`,
      },
    },
  ],

  ui: {
    modal: {
      title: 'CHAMPIONSHIP SHOPPING SHOWDOWN 💪',
      titleFont: "'Impact', 'Archivo Black', sans-serif",
      backgroundColor: '#000000',
      overlayColor: 'rgba(255, 215, 0, 0.15)',
      animation: 'slamEntrance',
      maxWidth: '900px',
    },

    layout: {
      type: 'hierarchy',
      cardSpacing: '24px',
      mobileBreakpoint: '768px',
    },

    typography: {
      headlineFont: "'Impact', 'Archivo Black', sans-serif",
      bodyFont: "'Roboto Condensed', 'Arial Narrow', sans-serif",
      accentFont: "'Impact', sans-serif",
      baseFontSize: '16px',
    },

    colors: {
      primary: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      primaryLight: '#FFFACD',
      neon: '#00FF00',
      textPrimary: '#FFFFFF',
      textSecondary: '#C0C0C0',
      black: '#000000',
      shadowGold: 'rgba(255, 215, 0, 0.3)',
    },

    darkMode: {
      enabled: true,
      colors: {
        primary: 'linear-gradient(135deg, #B8860B 0%, #8B4513 100%)',
        backgroundColor: '#000000',
        textPrimary: '#FFFFFF',
      },
    },
  },

  copy: {
    buttons: {
      proceed: 'AND THAT\'S THE BOTTOM LINE! 💪',
      reconsider: 'TAP OUT! 👎',
      close: 'Ring the Bell',
    },

    states: {
      loading: 'The champion is speaking...',
      error: 'DISQUALIFIED!',
      thinking: 'Cutting a promo...',
    },

    labels: {
      settings: 'Locker Room',
      active: 'IN THE RING',
    },

    notifications: {
      themeActivated: 'WWF Mode activated 💪',
      checkoutDetected: 'MATCH STARTING!',
    },
  },

  animations: {
    entrance: {
      name: 'slamEntrance',
      duration: '0.6s',
      easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
    },
  },

  behavior: {
    responseOrder: ['the-champion', 'the-heel', 'the-ref'],
    streamDelay: 25,
    characterDelay: 700,
    features: {
      autoClose: false,
      soundEffects: false,
      particleEffects: false,
    },
  },

  stylesheet: 'wwf-theme.css',
};
