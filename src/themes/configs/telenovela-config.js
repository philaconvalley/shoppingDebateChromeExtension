/**
 * Telenovela Mode - Soap Opera Drama
 * "Everything is a dramatic betrayal" themed shopping experience
 *
 * 🧼 STUB CONFIG - To be fully designed and implemented
 */

export const telenovelaConfig = {
  metadata: {
    id: 'telenovela',
    name: 'Telenovela Mode',
    description: 'Dramatic soap opera shopping saga - every purchase is a passionate betrayal',
    icon: '🧼',
    enabled: false, // Not yet implemented
    version: '0.1.0',
  },

  personalities: [
    {
      id: 'betrayed-lover',
      name: 'La Traicionada',
      role: 'enabler',
      icon: '💔',
      description: 'The betrayed lover - passionate and emotional',

      ui: {
        gradient: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)',
        borderColor: '#DC143C',
        accentColor: '#FFD700',
        cardSize: 'large',
        position: 'center',
      },

      prompt: {
        systemRole: 'You are the betrayed lover in a telenovela - dramatic, passionate, emotional. Every purchase decision is a matter of the heart. STUB: Full personality to be developed.',
        responseTemplate: (productContext) => `[TELENOVELA STUB] Dramatic response about ${productContext.productName}`,
      },
    },

    {
      id: 'the-cheater',
      name: 'El Infiel',
      role: 'skeptic',
      icon: '😈',
      description: 'The cheater - smooth talking and deceptive',

      ui: {
        gradient: 'linear-gradient(135deg, #4B0082 0%, #000000 100%)',
        borderColor: '#4B0082',
        accentColor: '#800020',
        cardSize: 'medium',
        position: 'left',
      },

      prompt: {
        systemRole: 'You are the smooth-talking cheater in a telenovela. STUB: Full personality to be developed.',
        responseTemplate: (productContext) => `[TELENOVELA STUB] Deceptive response about ${productContext.productName}`,
      },
    },

    {
      id: 'secret-accomplice',
      name: 'La Cómplice',
      role: 'mediator',
      icon: '🕯️',
      description: 'The secret accomplice - knows all the secrets',

      ui: {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
        borderColor: '#DAA520',
        accentColor: '#B8860B',
        cardSize: 'medium',
        position: 'right',
      },

      prompt: {
        systemRole: 'You are the knowing accomplice in a telenovela. STUB: Full personality to be developed.',
        responseTemplate: (productContext) => `[TELENOVELA STUB] Secretive response about ${productContext.productName}`,
      },
    },
  ],

  ui: {
    modal: {
      title: 'El Drama de las Compras 🧼',
      titleFont: "'Playfair Display', Georgia, serif",
      backgroundColor: '#1A0000',
      overlayColor: 'rgba(220, 20, 60, 0.2)',
      animation: 'dramaticEntrance',
      maxWidth: '900px',
    },

    layout: {
      type: 'hierarchy',
      cardSpacing: '24px',
      mobileBreakpoint: '768px',
    },

    typography: {
      headlineFont: "'Playfair Display', Georgia, serif",
      bodyFont: "'Crimson Text', Georgia, serif",
      accentFont: "'Cinzel', serif",
      baseFontSize: '15px',
    },

    colors: {
      primary: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)',
      primaryLight: '#FFF0F0',
      gold: '#FFD700',
      textPrimary: '#2D0A0A',
      textSecondary: '#6D4C4C',
      white: '#FFFFFF',
      shadowRed: 'rgba(220, 20, 60, 0.25)',
    },

    darkMode: {
      enabled: true,
      colors: {
        primary: 'linear-gradient(135deg, #8B0000 0%, #4B0000 100%)',
        backgroundColor: '#1A0000',
        textPrimary: '#FFE4E4',
      },
    },
  },

  copy: {
    buttons: {
      proceed: '¡Sí, Mi Amor! ❤️',
      reconsider: '¡No Puede Ser! 😱',
      close: 'Adiós, Traidor',
    },

    states: {
      loading: 'El drama se desarrolla...',
      error: '¡Qué tragedia!',
      thinking: 'Las pasiones se agitan...',
    },

    labels: {
      settings: 'Estudio de Telenovela',
      active: 'El drama está en vivo',
    },

    notifications: {
      themeActivated: 'Telenovela Mode activated 🧼',
      checkoutDetected: '¡Un momento dramático!',
    },
  },

  animations: {
    entrance: {
      name: 'dramaticEntrance',
      duration: '0.8s',
      easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    },
  },

  behavior: {
    responseOrder: ['betrayed-lover', 'the-cheater', 'secret-accomplice'],
    streamDelay: 40,
    characterDelay: 1000,
    features: {
      autoClose: false,
      soundEffects: false,
      particleEffects: true,
    },
  },

  stylesheet: 'telenovela-theme.css',
};
