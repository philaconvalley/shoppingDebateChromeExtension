# Shopping Debate - Chrome Extension

Three AI personalities debate your purchase decisions before checkout. Make thoughtful choices, not impulsive ones.

## The Personalities

**The Enabler** - Finds genuine value and benefits, creates vivid scenarios of how the purchase improves your life
**The Skeptic** - Raises practical questions, compares cost vs value, suggests alternatives
**The Mediator** - Synthesizes both perspectives, asks insightful questions, guides your decision

## Features

- **Real-Time AI Streaming**: Watch three personalities debate token-by-token (not simulated!)
- **Automatic Checkout Detection**: Triggers on checkout pages across any e-commerce site
- **Context-Aware Debates**: Each personality references actual product names and prices
- **"Yes, And..." Improv Style**: The Mediator builds upon specific arguments from both sides
- **Beautiful UI**: Gradient design with smooth animations
- **Multiple AI Models**: Choose from Claude, GPT-4, GPT-3.5, and more

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

This creates `dist/background.bundle.js` and `dist/content.bundle.js`.

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
4. Choose AI model (Claude 3 Haiku recommended)
5. Save settings

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
You reach checkout
    ↓
Modal appears with product context
    ↓
Enabler streams their argument
    ↓
Skeptic streams their counterpoint
    ↓
Mediator synthesizes both views
    ↓
You decide: Proceed or Reconsider
```

## Testing

### Test Page Included

Open `test-checkout.html` in Chrome to see the extension in action!

### Manual Trigger

1. Click extension icon
2. Click "Test on This Page"
3. Debate starts immediately

## Configuration

### AI Models

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Claude 3 Haiku | Fast | Good | Low | Recommended |
| Claude 3 Sonnet | Medium | Great | Medium | Balanced |
| GPT-3.5 Turbo | Fast | Good | Low | Fast & Cheap |
| GPT-4 | Slow | Excellent | High | Maximum Quality |
| Llama 3 8B | Medium | Good | Low | Budget |

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
├── dist/                         # Built files (generated by esbuild)
│   ├── background.bundle.js      # Bundled background service worker
│   └── content.bundle.js         # Bundled content script
├── src/                          # Source files
│   ├── background/
│   │   └── index.js              # Streaming orchestration (bundled)
│   ├── content/
│   │   ├── index.js              # Debate modal + message handling (bundled)
│   │   ├── checkout.js           # Checkout detection logic
│   │   └── debate-modal.css      # Gradient styling
│   ├── options/
│   │   ├── view.html             # Settings page (vanilla)
│   │   └── controller.js         # Settings logic (vanilla)
│   └── popup/
│       ├── view.html             # Extension popup (vanilla)
│       └── controller.js         # Popup logic (vanilla)
├── icons/                        # Extension icons (16x16, 48x48, 128x128)
├── manifest.json                 # Extension configuration
├── package.json                  # Build scripts
├── esbuild.config.js             # Build configuration
├── .env.example                  # Environment template
├── test-checkout.html            # Test page
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

**Important**: Both background and content scripts are bundled with esbuild.

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

**Impulse Control** - Add meaningful friction to checkout decisions
**Budget Management** - Second-guess purchases before committing
**Decision Training** - Learn to consider multiple perspectives
**Mindful Shopping** - Slow down and think before buying
**Value Assessment** - Practice evaluating cost vs benefit

## Privacy & Security

- API key stored in Chrome's encrypted storage
- No data sent except to OpenRouter
- No tracking or analytics
- No data collected or stored
- Open source - review the code!

## Future Enhancements

Ideas for v2.0:

- **Debate History**: Track past decisions and outcomes
- **Learning Mode**: Extension learns your values over time
- **Budget Tracking**: Integration with financial goals
- **Social Sharing**: Share interesting debates
- **A/B Testing**: Measure which personality is most persuasive
- **Voice Mode**: Hear the debate instead of reading it
- **Custom Personalities**: Create your own AI advisors

## Contributing

Feel free to:
- Fork and improve
- Submit pull requests
- Report bugs
- Suggest features
- Share your experiences

## License

MIT License - Free for personal and commercial use

## Acknowledgments

Built with:
- [OpenRouter API](https://openrouter.ai) - Multi-model AI access
- [esbuild](https://esbuild.github.io/) - Lightning-fast bundling

## Support

Need help?
- Check the Troubleshooting section above
- Review [OpenRouter docs](https://openrouter.ai/docs)
- Open an issue on GitHub

---

**Built for thoughtful shoppers who want to make better decisions**