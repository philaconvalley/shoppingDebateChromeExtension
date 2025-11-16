// Toast Notification System

import { TOAST_TYPES } from '../../shared/constants.js';

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, info, error)
 */
export function showToast(message, type = TOAST_TYPES.SUCCESS) {
  const toast = document.createElement('div');
  toast.className = `debate-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
