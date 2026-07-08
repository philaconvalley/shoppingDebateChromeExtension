# Shopping Debate - Chrome Extension

Three AI personalities debate your purchase decisions before checkout. Make thoughtful choices, not impulsive ones.

Built live by Team PhilaCon Valley ([Waskar Paulino](https://github.com/traksaw) & [Victor Jackson](https://victordjackson.netlify.app/)) in 4 hours for [CodeTV's Web Dev Challenge S2.E12](https://www.youtube.com/watch?v=BOCU-seUXQ8), sponsored by OpenRouter.

> **Status**: Not yet published to the Chrome Web Store — currently installable via "Load unpacked" (see [Quick Start](#quick-start) below).

![Shopping Debate modal live on an Amazon product page, showing The Enabler, The Skeptic, and The Mediator responses](docs/screenshots/debate-demo.png)
*From the live demo at [CodeTV's Web Dev Challenge S2.E12](https://youtu.be/BOCU-seUXQ8?t=1840) — timestamp 30:40.*

## The Personalities

**The Enabler** - Finds genuine value and benefits, creates vivid scenarios of how the purchase improves your life
**The Skeptic** - Raises practical questions, compares cost vs value, suggests alternatives
**The Mediator** - Synthesizes both perspectives, asks insightful questions, guides your decision

## Features

- **Real-Time AI Streaming**: Watch three personalities debate token-by-token (not simulated!)
- **Automatic Checkout Detection**: Triggers on checkout pages across any e-commerce site
- **Context-Aware Debates**: Each personality references actual product names and prices
- **Prominent Price Display**: See the price you're considering at the top of the debate
- **Price Threshold**: Only trigger debates for purchases above your set amount (default: $50)
- **Remind Me Later**: Set 3-day reminders for purchases you want to reconsider
- **Monthly Savings Tracker**: Track how much you've saved by reconsidering purchases
- **"Yes, And..." Improv Style**: The Mediator builds upon specific arguments from both sides
- **Multiple AI Models**: Choose from Claude, GPT-4, GPT-3.5, and more
- **4 Drama Themes**: Switch between Default, Regina (Mean Girls), Telenovela, and WWF modes with unique characters and styling
- **Audio Playback**: Optional text-to-speech with karaoke-style word highlighting (experimental)
- **Beautiful UI**: Animated character dialog boxes with theme-specific gradients and effects

## Quick Start

### 1. Get an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up and create a new API key
3. Copy the key (starts with `sk-or-...`)
4. Free credits available for new users!

### 2. Install Dependencies

```bash
# Navigate to the extension folder
cd /path/to/codeTVExtension

# Install dependencies
npm install
```

### 3. Build the Extension

```bash
# Build for production
npm run build

# Or watch mode for development
npm run watch
```

This creates bundled files in the `dist/` folder.

### 4. Load Extension in Chrome

```bash
# Open Chrome and go to:
chrome://extensions/

# 1. Enable "Developer mode" (top right)
# 2. Click "Load unpacked"
# 3. Select this extension folder
```

### 5. Configure Settings

**Option A: Through Extension UI**
1. Click the extension icon
2. Click "Open Settings"
3. Paste your OpenRouter API key
4. Set price threshold (default: $50 - only triggers for purchases above this amount)
5. Choose AI models for each personality (Claude 3 Haiku recommended)
6. Save settings

**Option B: Development Mode (.env file)**
1. Copy `.env.example` to `.env`
2. Add your API key: `OPENROUTER_API_KEY=sk-or-...`
3. Rebuild with `npm run build`

### 6. Reload the Extension

After building, reload the extension:
1. Go to `chrome://extensions/`
2. Find "Shopping Debate"
3. Click the reload icon

### 7. Shop and Debate!

Visit any checkout page - the debate will start automatically!

## How It Works

```
You reach checkout (price meets threshold)
    ↓
Character dialog boxes appear showing price
    ↓
Enabler streams their argument (emphasizes value)
    ↓
Skeptic streams their counterpoint (questions cost)
    ↓
Mediator synthesizes both views (balanced guidance)
    ↓
You choose an action:
  - Remind Me Later (3-day reminder)
  - I'll Reconsider (saves to monthly tracker)
  - Proceed to Purchase (continues checkout)
```

## Testing

### Test Page Included

Open `test-checkout.html` in Chrome to see the extension in action!

### Manual Trigger

1. Click extension icon
2. Click "Test on This Page"
3. Debate starts immediately

## Configuration

### Price Threshold

Control when debates trigger based on purchase amount:
- **Default**: $50 (only triggers for purchases above this amount)
- **Set to 0**: Triggers on all purchases regardless of price
- **Configure**: Extension Settings > Price Threshold field

This helps focus debates on significant purchases while avoiding debate fatigue on small items.

### Monthly Savings Tracker

Track your financial wins when you reconsider purchases:
- **Location**: Bottom of character dialog box (green card)
- **Metrics**: Total saved amount and number of reconsidered purchases this month
- **Storage**: Data persists month-by-month in Chrome storage
- **Reset**: Automatically starts fresh each new month

### Reminders

Set reminders for purchases you want to think about:
- **Duration**: 3 days from when you click "Remind Me Later"
- **Storage**: Saved in Chrome local storage with product details and URL
- **Use Case**: Prevent impulse buying by adding a cooling-off period

### Drama Themes

Choose from 4 unique themes that transform the debate experience:

| Theme | Characters | Style | Vibe |
|-------|-----------|-------|------|
| **Default** | The Enabler, The Skeptic, The Mediator | Clean, professional | Neutral and balanced |
| **Regina** | Regina George, Gretchen Wieners, Karen Smith | Mean Girls inspired | Sassy and dramatic |
| **Telenovela** | Valentina, Alejandro, Isabella | Spanish soap opera | Passionate and intense |
| **WWF** | The Bulldozer, Steel Fist, Candy Slam | Wrestling promo style | Loud and energetic |

**How to switch themes:**
1. Click the extension icon
2. Select your preferred theme from "CHOOSE YOUR DRAMA MODE"
3. The debate UI will update with new characters, colors, and personality styles

Each theme features:
- Unique character names and personalities
- Custom color schemes and gradients
- Theme-specific animations
- Tailored dialogue styles

### AI Models

Choose different models for each personality to create unique debate dynamics:

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Claude 3 Haiku | Fast | Good | Low | Recommended |
| Claude 3.5 Sonnet | Medium | Great | Medium | Balanced |
| Claude 3 Opus | Slow | Excellent | High | Premium Quality |
| GPT-3.5 Turbo | Fast | Good | Low | Fast & Cheap |
| GPT-4 | Slow | Excellent | High | Maximum Quality |
| Llama 3 8B | Medium | Good | Low | Budget |

**Tip**: Assign faster models (Haiku, GPT-3.5) to The Enabler, balanced models (Sonnet) to The Skeptic, and premium models (Opus, GPT-4) to The Mediator for optimal debate quality.

Check [OpenRouter pricing](https://openrouter.ai/models) for current rates.

## Architecture

### Component Overview

**Background Service Worker** (`dist/background.bundle.js`)
- Handles all OpenRouter API communication
- Streams AI responses token-by-token
- Manages three sequential personality streams
- Contains environment variable support for API keys

**Content Script** (`dist/content.bundle.js`)
- Detects checkout pages via URL patterns
- Creates and manages debate modal UI
- Receives streaming chunks from background
- Updates UI in real-time as tokens arrive

**Popup** (`src/popup/*` - vanilla JS)
- Shows extension status
- Links to settings page
- Provides manual trigger button

**Options Page** (`src/options/*` - vanilla JS)
- API key configuration
- Model selection
- Settings persistence via Chrome storage

### Message Flow

```
Content Script                Background Worker              OpenRouter
     |                              |                              |
     |--[generateDebateStreaming]-->|                              |
     |                              |--[HTTP POST with stream]---->|
     |                              |                              |
     |<--[personalityStart]---------|<--[stream chunk 1]-----------|
     |<--[personalityChunk]---------|<--[stream chunk 2]-----------|
     |<--[personalityChunk]---------|<--[stream chunk 3]-----------|
     |<--[personalityComplete]------|<--[stream end]---------------|
     |                              |                              |
     |<--[debateComplete]-----------|                              |
```

### Why Bundling?

1. **Background Script**: Chrome service workers need bundled dependencies
2. **Content Script**: Chrome doesn't support ES6 modules in content scripts
3. **Performance**: Single bundled file loads faster than multiple modules

## Project Structure

```
codeTVExtension/
├── dist/                         # Built files (generated by webpack)
│   ├── background.bundle.js      # Bundled background service worker
│   ├── content.bundle.js         # Bundled content script
│   ├── popup/                    # Popup files
│   └── options/                  # Options page files
├── src/                          # Source files
│   ├── background/
│   │   └── index.js              # Streaming orchestration + API calls
│   ├── content/
│   │   ├── index.js              # Main content script orchestrator
│   │   ├── checkout.js           # Checkout page detection
│   │   ├── ui/                   # UI components
│   │   ├── services/             # Savings, reminders services
│   │   └── utils/                # Utility functions
│   ├── themes/
│   │   ├── themeConfig.js        # Theme definitions
│   │   ├── theme-switcher.js     # Theme switching logic
│   │   └── styles/               # Theme-specific CSS files
│   ├── shared/
│   │   ├── constants.js          # Shared constants
│   │   └── storage.js            # Chrome storage helpers
│   ├── options/
│   │   ├── view.html             # Settings page
│   │   └── controller.js         # Settings logic
│   └── popup/
│       ├── view.html             # Extension popup
│       └── controller.js         # Popup logic + theme selector
├── icons/                        # Extension icons
├── docs/                         # Documentation
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── CODE_OF_CONDUCT.md        # Community standards
│   ├── PUBLISH_TO_GITHUB.md      # Publishing guide
│   └── READY_FOR_GITHUB.md       # Status summary
├── manifest.json                 # Extension configuration
├── package.json                  # Dependencies and scripts
├── webpack.config.js             # Build configuration
├── .env.example                  # Environment template
├── LICENSE                       # MIT License
└── README.md                     # This file
```

## Development

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (auto-rebuild)
npm run watch
```

### Workflow

**Important**: Both background and content scripts are bundled with webpack.

1. Make changes to source files:
   - `src/background/index.js` - Background service worker
   - `src/content/index.js` - Content script (debate modal)
   - `src/content/checkout.js` - Checkout detection
2. Rebuild: `npm run build` (or use `npm run watch` for auto-rebuild)
3. Go to `chrome://extensions/` and click "Reload" on Shopping Debate
4. Reload the test page or checkout page to see changes

**Why bundling is required:**
- Background script needs to bundle dependencies
- Content scripts cannot use ES6 modules natively in Chrome
- Both are bundled to resolve imports and dependencies

### Customizing Prompts

Edit the prompt builders in `src/background/index.js`:

```javascript
function buildEnablerPrompt(productContext) {
  // Customize Enabler's personality and approach
}

function buildSkepticPrompt(productContext) {
  // Customize Skeptic's arguments
}

function buildMediatorPrompt(productContext, previousResponses) {
  // Customize how Mediator synthesizes perspectives
}
```

### Customizing Checkout Detection

Edit `CHECKOUT_PATTERNS` in `src/content/checkout.js`:

```javascript
const CHECKOUT_PATTERNS = [
  /checkout/i,
  /your-custom-pattern/i,
  // Add more patterns
];
```

## Troubleshooting

### Modal Doesn't Appear

- Check extension is enabled at `chrome://extensions/`
- Verify URL contains checkout keywords
- Check DevTools console (F12) for errors
- Try "Test on This Page" button

### Streaming Not Working

- Verify API key starts with `sk-or-`
- Check OpenRouter credits at dashboard
- Test with different AI model
- Check network tab for streaming response

### Extension Loads But Settings Don't Save

- Check Chrome storage permissions in manifest
- Try resetting to defaults
- Check DevTools console for errors

### "Cannot use import statement outside a module" Error

This means the content script isn't bundled:
- Run `npm run build` to create `dist/content.bundle.js`
- Verify `manifest.json` points to `dist/content.bundle.js`
- Reload extension at `chrome://extensions/`

### API Key Issues

**"User not found" error:**
- Your API key is invalid or expired
- Get a new key at [OpenRouter](https://openrouter.ai/keys)
- Update settings or `.env` file with new key
- Rebuild: `npm run build`
- Reload extension

**Development Mode:**
Extension uses `.env` file or settings-configured key.

## Advanced Tips

### Reducing API Costs

- Use Claude 3 Haiku or GPT-3.5 Turbo
- Lower `max_tokens` in `src/background/index.js`
- Add debate cooldown to prevent rapid triggers

### Better Product Context

Enhance `extractProductContext()` in `src/content/checkout.js`:
- Add more price selectors
- Parse product descriptions
- Extract review ratings
- Calculate price per unit

### Adding a Fourth Personality

1. Add streaming call in `handleStreamingDebate()`
2. Create prompt builder function
3. Add personality card HTML in `createDebateModal()`
4. Update CSS with new personality colors

## Use Cases

**Impulse Control** - Add meaningful friction to checkout decisions with cooling-off reminders
**Budget Management** - Track monthly savings and see the financial impact of reconsidering purchases
**Decision Training** - Learn to consider multiple perspectives through AI-guided debate
**Mindful Shopping** - Slow down and think before buying with price-aware discussions
**Value Assessment** - Practice evaluating cost vs benefit with AI personalities
**Financial Goals** - Set price thresholds to focus on significant purchases only
**Savings Motivation** - Watch your monthly savings grow as you make thoughtful choices

## Privacy & Security

- API key stored in Chrome's encrypted storage
- No data sent except to OpenRouter
- No tracking or analytics
- No data collected or stored
- Open source - review the code!

## Future Enhancements

Ideas for future versions:

- **Reminder Notifications**: Browser notifications when 3-day reminder is up
- **Debate History**: Full archive of past debates with outcomes
- **Learning Mode**: Extension learns your values and priorities over time
- **Spending Insights**: Visualize savings trends and purchase patterns
- **Category Tracking**: Track savings by product category
- **Social Sharing**: Share interesting debates with friends
- **A/B Testing**: Measure which personality is most persuasive for you
- **Voice Mode**: Hear the debate instead of reading it
- **Custom Personalities**: Create your own AI advisors with custom prompts
- **Budget Goals**: Set monthly spending limits and get warnings

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:
- Setting up your development environment
- Code style guidelines
- Submitting pull requests
- Reporting bugs and requesting features

Also review our [Code of Conduct](docs/CODE_OF_CONDUCT.md).

## License

MIT License - Free for personal and commercial use

## Acknowledgments

- Built by Team PhilaCon Valley (Waskar Paulino & Victor Jackson) for [CodeTV's Web Dev Challenge S2.E12](https://www.youtube.com/watch?v=BOCU-seUXQ8), sponsored by OpenRouter
- [OpenRouter API](https://openrouter.ai) - Multi-model AI access
- [Webpack](https://webpack.js.org/) - Module bundling

## Support

Need help?
- Check the Troubleshooting section above
- Review [OpenRouter docs](https://openrouter.ai/docs)
- Open an issue on GitHub

---

**Built for thoughtful shoppers who want to make better decisions**