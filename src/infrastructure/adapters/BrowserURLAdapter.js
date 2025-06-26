/**
 * Adapter for browser URL operations
 * Implements abstraction for URL manipulation
 */
export class BrowserURLAdapter {
  constructor() {
    this._parameters = new Map();
  }

  /**
   * Get URL parameter value
   * @param {string} name - Parameter name
   * @returns {string|null} Parameter value or null
   */
  getParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * Set URL parameter (staged, not applied until updateURL)
   * @param {string} name - Parameter name
   * @param {string} value - Parameter value
   */
  setParameter(name, value) {
    this._parameters.set(name, value);
  }

  /**
   * Remove URL parameter (staged, not applied until updateURL)
   * @param {string} name - Parameter name
   */
  removeParameter(name) {
    this._parameters.set(name, null);
  }

  /**
   * Apply all staged parameter changes to the URL
   */
  updateURL() {
    const currentUrl = new URL(window.location);

    // Apply all staged changes
    this._parameters.forEach((value, name) => {
      if (value === null) {
        currentUrl.searchParams.delete(name);
      } else {
        currentUrl.searchParams.set(name, value);
      }
    });

    // Update URL without page reload
    window.history.pushState({}, '', currentUrl.toString());

    // Clear staged changes
    this._parameters.clear();
  }
}
