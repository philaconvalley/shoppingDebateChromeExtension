# Contributing to Shopping Debate

Thank you for your interest in contributing! Shopping Debate is a Chrome extension that helps people make thoughtful purchase decisions through AI-powered debates. We welcome contributions of all kinds.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm
- Chrome browser
- An [OpenRouter](https://openrouter.ai/keys) API key (free credits available for new users)

### Local Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/<your-username>/shoppingDebateChromeExtension.git
   cd shoppingDebateChromeExtension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Add your OpenRouter API key to .env
   ```

4. Build and load:
   ```bash
   npm run build
   ```
   Then load the `dist/` folder as an unpacked extension at `chrome://extensions/`

5. For development with auto-rebuild:
   ```bash
   npm run watch
   ```

## Ways to Contribute

### Code
- Fix bugs or implement features from the [issues list](https://github.com/philaconvalley/shoppingDebateChromeExtension/issues)
- Look for `good first issue` labels if you're new
- Improve checkout detection patterns for more e-commerce sites
- Add new drama themes or personalities

### Design
- Propose UI/UX improvements
- Create new theme designs
- Improve accessibility

### Documentation
- Improve setup instructions
- Add troubleshooting tips
- Write guides for common customizations

### Testing
- Test on different e-commerce sites and report results
- Test across browsers and OS versions
- Report bugs with detailed reproduction steps

## How to Contribute

1. **Find or create an issue** describing what you want to work on
2. **Comment on the issue** to let others know you're working on it
3. **Create a branch** from `main` with a descriptive name
4. **Make your changes** — keep PRs focused and reasonably small
5. **Test thoroughly**:
   - Build with `npm run build`
   - Test on `test-checkout.html`
   - Test on at least one real e-commerce site
   - Check all themes if your change affects UI
6. **Open a pull request** using the PR template

## Project Structure

```
src/
├── background/     # Service worker, API calls, streaming
├── content/        # Content script, checkout detection, UI
├── themes/         # Theme configs and styles
├── shared/         # Constants and storage helpers
├── options/        # Settings page
└── popup/          # Extension popup
```

## Code Style

- Use clear, descriptive variable and function names
- Comment complex logic, but prefer self-documenting code
- Keep functions focused — one responsibility per function
- Test your changes across multiple themes

## Questions?

Open an issue or comment on an existing one. We're happy to help you get started!
