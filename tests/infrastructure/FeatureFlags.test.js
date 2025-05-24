import { FeatureFlags } from '../../src/infrastructure/FeatureFlags.js';

describe('FeatureFlags', () => {
  let featureFlags;

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    featureFlags = new FeatureFlags();
  });

  describe('Basic functionality', () => {
    test('should initialize with default flags', () => {
      expect(featureFlags.isEnabled('SOUND_EFFECTS')).toBe(true);
      expect(featureFlags.isEnabled('NEW_POWER_UPS')).toBe(false);
      expect(featureFlags.isEnabled('TOUCH_CONTROLS')).toBe(true);
    });

    test('should enable a feature flag', () => {
      featureFlags.enable('NEW_POWER_UPS');
      expect(featureFlags.isEnabled('NEW_POWER_UPS')).toBe(true);
    });

    test('should disable a feature flag', () => {
      featureFlags.disable('SOUND_EFFECTS');
      expect(featureFlags.isEnabled('SOUND_EFFECTS')).toBe(false);
    });

    test('should return false for non-existent flags', () => {
      expect(featureFlags.isEnabled('NON_EXISTENT_FLAG')).toBe(false);
    });

    test('should return all flags', () => {
      const allFlags = featureFlags.getAllFlags();
      expect(allFlags).toHaveProperty('SOUND_EFFECTS');
      expect(allFlags).toHaveProperty('NEW_POWER_UPS');
      expect(allFlags).toHaveProperty('TOUCH_CONTROLS');
    });
  });

  describe('withFeature functionality', () => {
    test('should execute enabled callback when feature is enabled', () => {
      const enabledCallback = jest.fn(() => 'enabled');
      const disabledCallback = jest.fn(() => 'disabled');

      featureFlags.enable('TEST_FEATURE');
      const result = featureFlags.withFeature('TEST_FEATURE', enabledCallback, disabledCallback);

      expect(enabledCallback).toHaveBeenCalled();
      expect(disabledCallback).not.toHaveBeenCalled();
      expect(result).toBe('enabled');
    });

    test('should execute disabled callback when feature is disabled', () => {
      const enabledCallback = jest.fn(() => 'enabled');
      const disabledCallback = jest.fn(() => 'disabled');

      featureFlags.disable('TEST_FEATURE');
      const result = featureFlags.withFeature('TEST_FEATURE', enabledCallback, disabledCallback);

      expect(enabledCallback).not.toHaveBeenCalled();
      expect(disabledCallback).toHaveBeenCalled();
      expect(result).toBe('disabled');
    });

    test('should return null when no disabled callback provided', () => {
      const enabledCallback = jest.fn(() => 'enabled');

      featureFlags.disable('TEST_FEATURE');
      const result = featureFlags.withFeature('TEST_FEATURE', enabledCallback);

      expect(enabledCallback).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('Percentage rollout', () => {
    test('should return false if feature is disabled', () => {
      featureFlags.disable('TEST_FEATURE');
      const result = featureFlags.isEnabledForPercentage('TEST_FEATURE', 100, 'user123');
      expect(result).toBe(false);
    });

    test('should be consistent for the same user', () => {
      featureFlags.enable('TEST_FEATURE');
      const result1 = featureFlags.isEnabledForPercentage('TEST_FEATURE', 50, 'user123');
      const result2 = featureFlags.isEnabledForPercentage('TEST_FEATURE', 50, 'user123');
      expect(result1).toBe(result2);
    });

    test('should return true for 100% rollout', () => {
      featureFlags.enable('TEST_FEATURE');
      const result = featureFlags.isEnabledForPercentage('TEST_FEATURE', 100, 'user123');
      expect(result).toBe(true);
    });

    test('should return false for 0% rollout', () => {
      featureFlags.enable('TEST_FEATURE');
      const result = featureFlags.isEnabledForPercentage('TEST_FEATURE', 0, 'user123');
      expect(result).toBe(false);
    });

    test('should distribute users across percentage buckets', () => {
      featureFlags.enable('TEST_FEATURE');

      const users = Array.from({ length: 100 }, (_, i) => `user${i}`);
      const enabledUsers = users.filter(userId =>
        featureFlags.isEnabledForPercentage('TEST_FEATURE', 50, userId)
      );

      // Should be approximately 50% (allow for some variance due to hash distribution)
      expect(enabledUsers.length).toBeGreaterThan(30);
      expect(enabledUsers.length).toBeLessThan(70);
    });
  });

  describe('Hash function', () => {
    test('should produce consistent hash for same input', () => {
      const hash1 = featureFlags.simpleHash('test');
      const hash2 = featureFlags.simpleHash('test');
      expect(hash1).toBe(hash2);
    });

    test('should produce different hashes for different inputs', () => {
      const hash1 = featureFlags.simpleHash('test1');
      const hash2 = featureFlags.simpleHash('test2');
      expect(hash1).not.toBe(hash2);
    });

    test('should always return positive numbers', () => {
      const hash = featureFlags.simpleHash('test');
      expect(hash).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Environment detection', () => {
    test('should detect local development environment', () => {
      // Mock window.location for testing
      const originalLocation = window?.location;

      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      });

      const flags = new FeatureFlags();
      expect(flags.isLocalDevelopment()).toBe(true);

      // Restore original location
      if (originalLocation) {
        Object.defineProperty(window, 'location', {
          value: originalLocation,
          writable: true
        });
      }
    });

    test('should not detect production as local development', () => {
      const originalLocation = window?.location;

      Object.defineProperty(window, 'location', {
        value: { hostname: 'vim-for-kids.com' },
        writable: true
      });

      const flags = new FeatureFlags();
      expect(flags.isLocalDevelopment()).toBe(false);

      // Restore original location
      if (originalLocation) {
        Object.defineProperty(window, 'location', {
          value: originalLocation,
          writable: true
        });
      }
    });
  });

  describe('Remote config loading', () => {
    test('should load flags from localStorage', async () => {
      const remoteFlags = { REMOTE_FEATURE: true };
      localStorage.setItem('remoteFeatureFlags', JSON.stringify(remoteFlags));

      const flags = await featureFlags.loadFromRemoteConfig();
      expect(flags).toEqual(remoteFlags);
    });

    test('should handle invalid JSON gracefully', async () => {
      localStorage.setItem('remoteFeatureFlags', 'invalid json');

      const flags = await featureFlags.loadFromRemoteConfig();
      expect(flags).toEqual({});
    });

    test('should handle missing localStorage gracefully', async () => {
      const flags = await featureFlags.loadFromRemoteConfig();
      expect(flags).toEqual({});
    });
  });
});
