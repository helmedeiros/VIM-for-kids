/**
 * URL operations that can be tested in isolation
 * Contains pure logic without browser dependencies
 */
export class URLOperations {
  /**
   * Validate parameter name
   * @param {string} name - Parameter name to validate
   * @returns {boolean} True if name is valid
   */
  static isValidParameterName(name) {
    return typeof name === 'string' && name.trim() !== '';
  }

  /**
   * Validate parameter value
   * @param {*} value - Value to validate
   * @returns {boolean} True if value is valid
   */
  static isValidParameterValue(value) {
    return value !== undefined && value !== null;
  }

  /**
   * Apply parameter changes to URL search params
   * @param {URLSearchParams} searchParams - URL search params object
   * @param {Map} changes - Map of parameter changes
   */
  static applyParameterChanges(searchParams, changes) {
    changes.forEach((value, name) => {
      if (value === null) {
        searchParams.delete(name);
      } else if (URLOperations.isValidParameterValue(value)) {
        searchParams.set(name, value);
      }
    });
  }

  /**
   * Validate URL object
   * @param {URL} url - URL to validate
   * @returns {boolean} True if URL is valid
   */
  static isValidURL(url) {
    return url instanceof URL;
  }
}

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
    if (!URLOperations.isValidParameterName(name)) {
      return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * Set URL parameter (staged, not applied until updateURL)
   * @param {string} name - Parameter name
   * @param {string} value - Parameter value
   */
  setParameter(name, value) {
    if (!URLOperations.isValidParameterName(name)) {
      return;
    }

    this._parameters.set(name, value);
  }

  /**
   * Remove URL parameter (staged, not applied until updateURL)
   * @param {string} name - Parameter name
   */
  removeParameter(name) {
    if (!URLOperations.isValidParameterName(name)) {
      return;
    }

    this._parameters.set(name, null);
  }

  /**
   * Apply all staged parameter changes to the URL
   */
  updateURL() {
    const currentUrl = new URL(window.location);

    if (!URLOperations.isValidURL(currentUrl)) {
      return;
    }

    // Apply all staged changes
    URLOperations.applyParameterChanges(currentUrl.searchParams, this._parameters);

    // Update URL without page reload
    window.history.pushState({}, '', currentUrl.toString());

    // Clear staged changes
    this._parameters.clear();
  }
}
