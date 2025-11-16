# Contributing to Shopping Debate

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/shopping-debate.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- Google Chrome browser
- OpenRouter API key (get free credits at [openrouter.ai](https://openrouter.ai/keys))

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add your OpenRouter API key to `.env`
3. Run `npm run build` to build the extension
4. Load the extension in Chrome from `chrome://extensions/`

### Development Workflow
```bash
# Watch mode for auto-rebuild during development
npm run watch

# Build for production
npm run build
```

After making changes:
1. Rebuild the extension
2. Go to `chrome://extensions/` and click reload
3. Test your changes on `test-checkout.html` or a real checkout page

## Code Style

- Use ES6+ JavaScript features
- Follow existing code formatting
- Add comments for complex logic
- Keep functions focused and small
- Use descriptive variable names

## Project Structure

```
src/
├── background/     # Background service worker (API calls)
├── content/        # Content scripts (UI and page interaction)
├── popup/          # Extension popup UI
├── options/        # Settings page
├── shared/         # Shared utilities and constants
└── themes/         # Theme configurations and styles
```

## Adding New Features

### Adding a New Theme
1. Create CSS file in `src/themes/styles/`
2. Add theme config to `src/themes/themeConfig.js`
3. Update `THEME_CHARACTERS` in `src/themes/theme-switcher.js`
4. Add theme button to `src/popup/view.html`

### Adding a New Personality
1. Update `PERSONALITIES` in `src/shared/constants.js`
2. Add prompt builder in `src/background/index.js`
3. Add character UI in `src/content/ui/template.js`
4. Update streaming logic in `src/background/index.js`

### Adding New AI Models
1. Add model to options in `src/options/view.html`
2. Add model to popup selects in `src/popup/view.html`
3. Update `DEFAULT_MODELS` in `src/shared/constants.js` if needed

## Testing

### Manual Testing
1. Use `test-checkout.html` for basic testing
2. Test on real e-commerce sites (Amazon, eBay, etc.)
3. Test all themes
4. Test all three action buttons (Remind, Reconsider, Proceed)
5. Verify savings tracker updates correctly

### Test Checklist
- [ ] Extension loads without errors
- [ ] Debate triggers on checkout pages
- [ ] All three personalities stream correctly
- [ ] Theme switching works
- [ ] Reminders save and display
- [ ] Savings tracker updates
- [ ] Settings persist after reload
- [ ] Price threshold works correctly

## Submitting Changes

### Pull Request Process
1. Update README.md if you've added features
2. Test thoroughly on multiple sites
3. Commit with clear, descriptive messages
4. Push to your fork
5. Open a Pull Request with:
   - Clear description of changes
   - Screenshots/GIFs if UI changes
   - Test results
   - Related issue numbers

### Commit Message Format
```
type: brief description

Longer explanation if needed

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat: add dark mode theme`
- `fix: prevent duplicate debates on same page`
- `docs: update installation instructions`

## Reporting Bugs

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS 14.0]
- Chrome Version: [e.g. 120.0]
- Extension Version: [e.g. 1.0.0]

**Console Errors**
Paste any console errors from DevTools.
```

## Feature Requests

We welcome feature ideas! Please:
1. Check if the feature already exists or is planned
2. Open an issue with the `enhancement` label
3. Describe the use case and expected behavior
4. Include mockups if applicable

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## Questions?

- Open an issue with the `question` label
- Check existing issues and discussions
- Review the README and documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
