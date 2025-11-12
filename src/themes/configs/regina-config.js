/**
 * Regina Mode - Mean Girls Shopping Experience
 * "On Wednesdays We Wear Pink" themed shopping companion
 */

export const reginaConfig = {
  metadata: {
    id: 'regina',
    name: 'Regina Mode',
    description: 'Shopping with The Plastics - Mean Girls style shopping judgment',
    icon: '👑',
    enabled: true,
    version: '1.0.0',
  },

  // Personality configurations for AI characters
  personalities: [
    {
      id: 'regina',
      name: 'Regina George',
      role: 'enabler',
      icon: '👑',
      description: 'Queen Bee - Confident, assertive shopping enabler',

      // Visual styling
      ui: {
        gradient: 'linear-gradient(135deg, #FFB6D9 0%, #FF69B4 50%, #FF1493 100%)',
        borderColor: '#FF1493',
        accentColor: '#FFD700', // Gold for hover states
        cardSize: 'large', // Regina's card is bigger
        position: 'center', // Center of the layout
      },

      // AI prompt configuration
      prompt: {
        systemRole: `You are Regina George from Mean Girls - the confident, fashionable queen bee of North Shore High School.
You're giving shopping advice with your signature assertive style. You're honest, direct, and always know what's fetch (cool) and what's not.

Your personality:
- Confident and decisive
- Fashion-forward and trend-aware
- Direct but not cruel - you're helping, not bullying
- Use phrases like "Obviously," "That's so fetch," "Get in, loser"
- You appreciate quality and style
- You're not afraid to be enthusiastic about something you love

Keep responses under 80 words. Be authentic Regina - confident and fun, not mean-spirited.`,

        responseTemplate: (productContext) => `Look at this ${productContext.productName || 'item'} for $${productContext.price || 'unknown'}.

${productContext.description ? `Description: ${productContext.description}` : ''}

Give your Regina George take on whether they should buy this. Be honest, direct, and fabulous. Would this be fetch or not?`,
      },
    },

    {
      id: 'gretchen',
      name: 'Gretchen Wieners',
      role: 'skeptic',
      icon: '😬',
      description: 'Insecure Skeptic - Overthinks everything',

      ui: {
        gradient: 'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)',
        borderColor: '#BA55D3',
        accentColor: '#9370DB',
        cardSize: 'medium',
        position: 'left',
      },

      prompt: {
        systemRole: `You are Gretchen Wieners from Mean Girls - insecure, eager to please, and constantly worried about what others think.
You overthink purchases and worry about trends, prices, and whether Regina would approve.

Your personality:
- Anxious and second-guessing
- Concerned about value and practicality
- Worried about what's "in" or "out"
- Use phrases like "I don't know if," "But what about," "Is that even still cool?"
- You want to be helpful but you're nervous
- You reference trends and what other people are doing

Keep responses under 80 words. Be authentically nervous Gretchen - concerned and questioning.`,

        responseTemplate: (productContext) => `Okay so they're looking at ${productContext.productName || 'this'} for $${productContext.price || 'unknown'}.

${productContext.description ? `It's described as: ${productContext.description}` : ''}

Give your Gretchen Wieners perspective - what concerns do you have? Is it worth it? What should they worry about? Be practical but anxious.`,
      },
    },

    {
      id: 'karen',
      name: 'Karen Smith',
      role: 'mediator',
      icon: '🤷‍♀️',
      description: 'Ditzy Mediator - Obliviously optimistic',

      ui: {
        gradient: 'linear-gradient(135deg, #FFE4E1 0%, #FFC0CB 100%)',
        borderColor: '#FFC0CB',
        accentColor: '#FFB6C1',
        cardSize: 'medium',
        position: 'right',
      },

      prompt: {
        systemRole: `You are Karen Smith from Mean Girls - sweet, ditzy, and blissfully unaware of complexity.
You give simple, optimistic shopping advice without overthinking anything. You're the tiebreaker who sees things simply.

Your personality:
- Cheerful and simple-minded
- Sees the bright side of everything
- Doesn't understand complicated things
- Use phrases like "I don't really get it but," "That sounds fun!" "Oh my god, cute!"
- You're genuinely sweet and positive
- You simplify complex decisions

Keep responses under 80 words. Be authentically Karen - simple, sweet, and obliviously positive.`,

        responseTemplate: (productContext, reginaResponse, gretchenResponse) => `So Regina and Gretchen talked about ${productContext.productName || 'this thing'}.

Regina said: ${reginaResponse || 'something about it'}
Gretchen said: ${gretchenResponse || 'she was worried'}

Give your Karen Smith take - keep it simple and positive. Help them decide in your own sweet, uncomplicated way.`,
      },
    },
  ],

  // UI/UX configuration
  ui: {
    // Modal styling
    modal: {
      title: 'Shopping with The Plastics 💅',
      titleFont: "'Playfair Display', Georgia, serif",
      backgroundColor: '#FFFFFF',
      overlayColor: 'rgba(255, 20, 147, 0.15)',
      animation: 'reginaEntrance',
      maxWidth: '900px',
    },

    // Layout configuration
    layout: {
      type: 'hierarchy', // Regina center, others flanking
      cardSpacing: '24px',
      mobileBreakpoint: '768px',
    },

    // Typography
    typography: {
      headlineFont: "'Playfair Display', Georgia, serif",
      bodyFont: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      accentFont: "'Archivo Black', Impact, sans-serif",
      baseFontSize: '15px',
    },

    // Color system
    colors: {
      primary: 'linear-gradient(135deg, #FFB6D9 0%, #FF69B4 50%, #FF1493 100%)',
      primaryLight: '#FFE4F0',
      primaryMedium: '#FFB6D9',
      primaryHot: '#FF69B4',
      primaryDeep: '#FF1493',
      primaryBurn: '#C71585',

      gold: '#FFD700',
      goldLight: '#FFF8DC',

      textPrimary: '#2D1B2E',
      textSecondary: '#6B4C6D',

      white: '#FFFFFF',
      shadowPink: 'rgba(255, 20, 147, 0.15)',

      success: '#90EE90',
      warning: '#FFD700',
      error: '#8B0000',
    },

    // Dark mode overrides
    darkMode: {
      enabled: true,
      colors: {
        primary: 'linear-gradient(135deg, #C71585 0%, #8B008B 100%)',
        backgroundColor: '#1A0A1F',
        textPrimary: '#FFE4F0',
        overlayColor: 'rgba(199, 21, 133, 0.2)',
      },
    },
  },

  // Copy/microcopy configuration
  copy: {
    buttons: {
      proceed: 'That\'s So Fetch! 💖',
      reconsider: 'Whatever 🙄',
      close: 'Bye, Felicia',
    },

    states: {
      loading: 'Regina is judging...',
      error: 'That\'s not going to happen',
      empty: 'Nothing to judge here',
      thinking: 'Consulting The Plastics...',
    },

    labels: {
      settings: 'Plastics HQ',
      status: 'Plastic Status',
      active: 'On Wednesdays we wear pink',
      inactive: 'Not ready yet',
    },

    notifications: {
      themeActivated: 'Regina Mode activated 👑',
      checkoutDetected: 'OMG, shopping detected!',
      analysisComplete: 'The Plastics have spoken',
    },
  },

  // Animation configurations
  animations: {
    entrance: {
      name: 'reginaEntrance',
      duration: '0.5s',
      easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    },

    cardHover: {
      regina: {
        transform: 'translateY(-8px) scale(1.02)',
        shadow: '0 20px 40px var(--shadow-pink)',
        borderColor: 'var(--plastics-gold)',
      },
      gretchen: {
        transform: 'translateY(-4px) rotate(-2deg)',
        shadow: '0 10px 20px rgba(186, 85, 211, 0.2)',
      },
      karen: {
        transform: 'scale(1.05)',
        filter: 'brightness(1.1)',
      },
    },

    textStream: {
      enabled: true,
      effect: 'sparkle',
      duration: '0.6s',
    },

    buttonInteraction: {
      hover: 'scale(1.05)',
      active: 'scale(0.98)',
      sparkle: true,
    },
  },

  // Behavioral configurations
  behavior: {
    // Order of character responses
    responseOrder: ['regina', 'gretchen', 'karen'],

    // Timing
    streamDelay: 30, // ms between tokens
    characterDelay: 800, // ms before next character speaks

    // Features
    features: {
      autoClose: false,
      soundEffects: false, // Future: "That's so fetch!" audio
      particleEffects: true, // Sparkles on interactions
      hoverPreviews: true,
    },
  },

  // Stylesheet to load
  stylesheet: 'regina-theme.css',
};
