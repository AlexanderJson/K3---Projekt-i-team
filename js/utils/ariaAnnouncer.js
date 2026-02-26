/**
 * @file ariaAnnouncer.js
 * @description Utility for handling screen reader announcements via ARIA live regions.
 * Helps with Focus Management & Accessibility when dynamic content changes.
 */

/**
 * Announces a message to screen readers using an aria-live region.
 * Creates the region if it doesn't exist.
 * @param {string} message - The text to be announced by the screen reader.
 * @param {'polite' | 'assertive'} [politeness='polite'] - The priority of the announcement (default is 'polite').
 */
export function announceMessage(message, politeness = 'polite') {
  let announcer = document.getElementById('global-aria-announcer');

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'global-aria-announcer';
    // Style to visually hide it, but keep it available to screen readers
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.padding = '0';
    announcer.style.margin = '-1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    document.body.appendChild(announcer);
  }

  // Set ARIA attributes
  announcer.setAttribute('aria-live', politeness);
  announcer.setAttribute('aria-atomic', 'true');

  // Triggering text change forces the screen reader to announce it
  announcer.textContent = '';
  
  // Use a slight timeout to ensure the clear is registered before setting new text
  setTimeout(() => {
    announcer.textContent = message;
  }, 50);
}
