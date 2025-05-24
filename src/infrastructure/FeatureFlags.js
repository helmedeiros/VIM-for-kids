/**
 * Feature Flags System for Trunk-Based Development
 *
 * This system allows you to:
 * - Deploy code to production with incomplete features hidden
 * - Enable features gradually for different user groups
 * - Quickly disable features if issues are found
 * - A/B test different implementations
 */

class FeatureFlags {
  constructor() {
    this.flags = {
      // Game features
      NEW_POWER_UPS: false,
      MULTIPLAYER_MODE: false,
      SOUND_EFFECTS: true,
      TOUCH_CONTROLS: true,

      // Development features
      DEBUG_MODE: this.isLocalDevelopment(),
      PERFORMANCE_MONITORING: true,
      ERROR_REPORTING: true,

      // UI/UX experiments
      NEW_UI_THEME: false,
      TUTORIAL_MODE: true,
      ACHIEVEMENT_SYSTEM: false,

      // Load flags from environment or remote config
      ...this.loadFromEnvironment(),
      ...this.loadFromRemoteConfig()
    };
  }

  /**
   * Check if a feature flag is enabled
   * @param {string} flagName - Name of the feature flag
   * @returns {boolean} True if the flag is enabled
   */
  isEnabled(flagName) {
    return this.flags[flagName] || false;
  }

  /**
   * Enable a feature flag
   * @param {string} flagName - Name of the feature flag
   */
  enable(flagName) {
    this.flags[flagName] = true;
    this.persistToLocalStorage();
  }

  /**
   * Disable a feature flag
   * @param {string} flagName - Name of the feature flag
   */
  disable(flagName) {
    this.flags[flagName] = false;
    this.persistToLocalStorage();
  }

  /**
   * Get all feature flags and their states
   * @returns {Object} All feature flags
   */
  getAllFlags() {
    return { ...this.flags };
  }

  /**
   * Load flags from environment variables (build time)
   */
  loadFromEnvironment() {
    const envFlags = {};

    // In a real application, you might load these from process.env
    // For client-side apps, these would be injected at build time
    if (typeof window !== 'undefined' && window.FEATURE_FLAGS) {
      Object.assign(envFlags, window.FEATURE_FLAGS);
    }

    return envFlags;
  }

  /**
   * Load flags from remote configuration service
   * In production, this could be a service like LaunchDarkly, Split.io, etc.
   */
  async loadFromRemoteConfig() {
    try {
      // For demo purposes, we'll use localStorage to simulate remote config
      const remoteFlags = localStorage.getItem('remoteFeatureFlags');
      return remoteFlags ? JSON.parse(remoteFlags) : {};
    } catch (error) {
      console.warn('Failed to load remote feature flags:', error);
      return {};
    }
  }

  /**
   * Check if running in local development environment
   */
  isLocalDevelopment() {
    return (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.'))
    );
  }

  /**
   * Persist feature flags to localStorage for development
   */
  persistToLocalStorage() {
    if (typeof window !== 'undefined' && this.isLocalDevelopment()) {
      localStorage.setItem('devFeatureFlags', JSON.stringify(this.flags));
    }
  }

  /**
   * Create a feature flag wrapper for React-like conditional rendering
   * @param {string} flagName - Name of the feature flag
   * @param {Function} enabledCallback - Function to call if flag is enabled
   * @param {Function} disabledCallback - Function to call if flag is disabled
   */
  withFeature(flagName, enabledCallback, disabledCallback = () => null) {
    return this.isEnabled(flagName) ? enabledCallback() : disabledCallback();
  }

  /**
   * Percentage rollout - enable feature for a percentage of users
   * @param {string} flagName - Name of the feature flag
   * @param {number} percentage - Percentage of users (0-100)
   * @param {string} userId - User identifier for consistent rollout
   */
  isEnabledForPercentage(flagName, percentage, userId = 'default') {
    if (!this.isEnabled(flagName)) return false;

    // Simple hash function for consistent user assignment
    const hash = this.simpleHash(userId + flagName);
    return (hash % 100) < percentage;
  }

  /**
   * Simple hash function for user assignment
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlags();

// Export class for testing
export { FeatureFlags };
