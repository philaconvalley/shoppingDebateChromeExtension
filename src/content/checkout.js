// Checkout Detection Logic

import { CHECKOUT_PATTERNS } from '../shared/constants.js';

// Check if current page is a checkout page
export function isCheckoutPage() {
  const url = window.location.href;
  return CHECKOUT_PATTERNS.some(pattern => pattern.test(url));
}

// Extract product context from the page
export function extractProductContext() {
  const context = {
    url: window.location.href,
    title: document.title,
    prices: [],
    products: []
  };

  // Common price selectors
  const priceSelectors = [
    '[class*="price"]',
    '[class*="total"]',
    '[class*="cost"]',
    '[data-price]',
    '.price',
    '.total',
    '#total',
    '[id*="price"]',
    '[id*="total"]'
  ];

  // Find prices
  priceSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.textContent.trim();
      const priceMatch = text.match(/\$\s*[\d,]+\.?\d*/);
      if (priceMatch) {
        context.prices.push(priceMatch[0]);
      }
    });
  });

  // Common product name selectors
  const productSelectors = [
    '[class*="product"]',
    '[class*="item"]',
    'h1',
    'h2',
    '[data-product]',
    '.product-name',
    '.item-name'
  ];

  // Find product names
  productSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text.length > 5 && text.length < 100) {
        context.products.push(text);
      }
    });
  });

  // Format context for AI
  let formattedContext = `URL: ${context.url}\n`;
  formattedContext += `Page: ${context.title}\n`;

  if (context.products.length > 0) {
    formattedContext += `Products: ${context.products.slice(0, 3).join(', ')}\n`;
  }

  if (context.prices.length > 0) {
    formattedContext += `Prices: ${context.prices.slice(0, 3).join(', ')}\n`;
  }

  // Return both formatted string and raw context
  return {
    formatted: formattedContext,
    prices: context.prices,
    products: context.products,
    url: context.url,
    title: context.title
  };
}
