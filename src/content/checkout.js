// Product Page Detection Logic

import { CHECKOUT_PATTERNS } from '../shared/constants.js';

// Product page URL patterns for major e-commerce sites
const PRODUCT_PAGE_PATTERNS = [
  // Amazon
  /amazon\.com\/.*\/dp\//i,
  /amazon\.com\/.*\/product\//i,
  /amazon\.com\/gp\/product\//i,
  // General e-commerce patterns
  /\/product\//i,
  /\/item\//i,
  /\/p\//i,
  /\/products\//i
];

// Check if current page is a product page
export function isProductPage() {
  const url = window.location.href;

  // Check URL patterns
  const matchesPattern = PRODUCT_PAGE_PATTERNS.some(pattern => pattern.test(url));

  // Also check for "Add to Cart" button as confirmation
  const hasAddToCart = !!(
    document.querySelector('[id*="add-to-cart"]') ||
    document.querySelector('[name*="add-to-cart"]') ||
    document.querySelector('[class*="add-to-cart"]') ||
    document.querySelector('button[title*="Add to Cart"]') ||
    document.querySelector('input[value*="Add to Cart"]')
  );

  return matchesPattern || hasAddToCart;
}

// Legacy function name for backwards compatibility
export function isCheckoutPage() {
  return isProductPage();
}

// Extract product context from the page
export function extractProductContext() {
  const context = {
    url: window.location.href,
    title: document.title,
    productName: '',
    price: '',
    brand: '',
    rating: '',
    features: []
  };

  // Amazon-specific product name selectors (try in order of specificity)
  const productNameSelectors = [
    '#productTitle',
    '[id*="productTitle"]',
    'h1[class*="product"]',
    'h1 span',
    '.product-title',
    'h1'
  ];

  for (const selector of productNameSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim().length > 10) {
      context.productName = element.textContent.trim();
      break;
    }
  }

  // Amazon-specific price selectors
  const priceSelectors = [
    '.a-price .a-offscreen',
    '[class*="priceToPay"] .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price-whole',
    '[data-a-color="price"]',
    '[class*="price"]'
  ];

  for (const selector of priceSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      const priceMatch = text.match(/\$\s*[\d,]+\.?\d*/);
      if (priceMatch) {
        context.price = priceMatch[0];
        break;
      }
    }
  }

  // Extract brand
  const brandSelectors = [
    '#bylineInfo',
    '.po-brand .po-break-word',
    '[data-feature-name="bylineInfo"]'
  ];

  for (const selector of brandSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      context.brand = element.textContent.replace('Visit the', '').replace('Store', '').trim();
      break;
    }
  }

  // Extract rating
  const ratingElement = document.querySelector('[data-hook="rating-out-of-text"], .a-icon-alt');
  if (ratingElement) {
    context.rating = ratingElement.textContent.trim();
  }

  // Extract key features from bullet points
  const featureBullets = document.querySelectorAll('#feature-bullets li, [id*="feature"] li');
  featureBullets.forEach((bullet, index) => {
    if (index < 5) { // Limit to first 5 features
      const text = bullet.textContent.trim();
      if (text.length > 10 && text.length < 200) {
        context.features.push(text);
      }
    }
  });

  // Format context for AI
  let formattedContext = '';

  if (context.productName) {
    formattedContext += `Product: ${context.productName}\n`;
  }

  if (context.brand) {
    formattedContext += `Brand: ${context.brand}\n`;
  }

  if (context.price) {
    formattedContext += `Price: ${context.price}\n`;
  }

  if (context.rating) {
    formattedContext += `Rating: ${context.rating}\n`;
  }

  if (context.features.length > 0) {
    formattedContext += `Key Features:\n${context.features.map(f => `- ${f}`).join('\n')}\n`;
  }

  formattedContext += `URL: ${context.url}`;

  // Return both formatted string and raw context
  return {
    formatted: formattedContext,
    productName: context.productName,
    price: context.price,
    brand: context.brand,
    rating: context.rating,
    features: context.features,
    url: context.url,
    title: context.title
  };
}
