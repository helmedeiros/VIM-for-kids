import { VimForKidsGame } from '../../src/VimForKidsGame.js';

// Mock DOM elements for testing
const mockGameBoard = {
  setAttribute: jest.fn(),
  focus: jest.fn(),
  innerHTML: '',
  appendChild: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  querySelector: jest.fn(() => mockGameBoard),
  addEventListener: jest.fn(),
  style: {
    setProperty: jest.fn(),
  },
};

const mockKeyDisplay = {
  innerHTML: '',
  appendChild: jest.fn(),
  querySelectorAll: jest.fn(() => []),
};

// Setup DOM mocks
beforeAll(() => {
  // eslint-disable-next-line no-undef
  global.document = {
    getElementById: jest.fn((id) => {
      if (id === 'gameBoard') return mockGameBoard;
      return null;
    }),
    querySelector: jest.fn((selector) => {
      if (selector === '.key-display') return mockKeyDisplay;
      return null;
    }),
    createElement: jest.fn(() => ({
      className: '',
      classList: {
        add: jest.fn(),
      },
      style: {},
      appendChild: jest.fn(),
      textContent: '',
    })),
    addEventListener: jest.fn(),
  };

  // Mock window for level transitions
  // eslint-disable-next-line no-undef
  global.window = {
    location: {
      search: '',
    },
    history: {
      pushState: jest.fn(),
    },
    vimForKidsGame: null,
  };

  // Mock document.querySelectorAll for level button updates
  // eslint-disable-next-line no-undef
  global.document.querySelectorAll = jest.fn(() => [
    { classList: { remove: jest.fn() } },
    { classList: { remove: jest.fn() } },
    { classList: { remove: jest.fn() } },
  ]);

  // eslint-disable-next-line no-undef
  global.URL = jest.fn().mockImplementation((url) => ({
    searchParams: {
      set: jest.fn(),
    },
    toString: () => url,
  }));
});

describe('Level Transition Integration', () => {
  let game;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockGameBoard.setAttribute.mockClear();
    // eslint-disable-next-line no-undef
    global.alert = jest.fn();
    // eslint-disable-next-line no-undef
    global.window.vimForKidsGame = null;
  });

  describe('Single Zone Level Transition (Level 1 → Level 2)', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_1' });
      // eslint-disable-next-line no-undef
      global.window.vimForKidsGame = game;
    });

    it('should transition to level 2 when completing level 1', async () => {
      expect(game.currentLevel).toBe('level_1');
      expect(game.gameState.getCurrentZoneId()).toBe('zone_1');

      // Complete the zone by collecting all keys
      const keys = game.gameState.availableKeys;
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      // Verify zone is complete and level is complete
      expect(game.gameState.isCurrentZoneComplete()).toBe(true);
      expect(game.gameState.isLevelComplete()).toBe(true);

      // Move to gate position
      const gate = game.gameState.getGate();
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      // Should be ready for level progression
      expect(game.gameState.shouldProgressToNextLevel()).toBe(true);

      // Test the transitionToLevel method directly
      await game.transitionToLevel('level_2');

      // Verify level transition
      expect(game.currentLevel).toBe('level_2');
      expect(game.gameState.getCurrentZoneId()).toBe('zone_2');
      expect(game.gameState.getCurrentZoneIndex()).toBe(0);
    });
  });

  describe('Multi-Zone Level Transition (Level 2 → Level 3)', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_2' });
      // eslint-disable-next-line no-undef
      global.window.vimForKidsGame = game;
    });

    it('should transition through zones then to next level', async () => {
      expect(game.currentLevel).toBe('level_2');
      expect(game.gameState.getCurrentZoneId()).toBe('zone_2');
      expect(game.gameState.getTotalZones()).toBe(2);

      // Complete first zone
      const keys1 = game.gameState.availableKeys;
      keys1.forEach((key) => {
        game.gameState.collectKey(key);
      });

      const gate1 = game.gameState.getGate();
      game.gameState.cursor = game.gameState.cursor.moveTo(gate1.position);

      // Should progress to next zone
      expect(game.gameState.shouldProgressToNextZone()).toBe(true);
      expect(game.gameState.shouldProgressToNextLevel()).toBe(false);

      // Execute zone progression
      const progressionResult1 = game.gameState.executeProgression();
      expect(progressionResult1.type).toBe('zone');
      expect(game.gameState.getCurrentZoneIndex()).toBe(1);
      expect(game.gameState.getCurrentZoneId()).toBe('zone_3');

      // Complete second zone
      const keys2 = game.gameState.availableKeys;
      keys2.forEach((key) => {
        game.gameState.collectKey(key);
      });

      const gate2 = game.gameState.getGate();
      game.gameState.cursor = game.gameState.cursor.moveTo(gate2.position);

      // Should progress to next level
      expect(game.gameState.shouldProgressToNextLevel()).toBe(true);
      expect(game.gameState.isLevelComplete()).toBe(true);

      // Test level progression
      const progressionResult2 = game.gameState.executeProgression();
      expect(progressionResult2.type).toBe('level');
      expect(progressionResult2.nextLevelId).toBe('level_3');

      // Test the transitionToLevel method
      await game.transitionToLevel('level_3');

      // Verify level transition
      expect(game.currentLevel).toBe('level_3');
      expect(game.gameState.getCurrentZoneId()).toBe('zone_4');
      expect(game.gameState.getCurrentZoneIndex()).toBe(0);
    });
  });

  describe('Level Transition Methods', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_1' });
    });

    it('should have transitionToLevel method', () => {
      expect(typeof game.transitionToLevel).toBe('function');
    });

    it('should clean up previous state when transitioning', async () => {
      const originalCleanup = game.cleanup;
      game.cleanup = jest.fn();

      await game.transitionToLevel('level_2');

      expect(game.cleanup).toHaveBeenCalled();

      // Restore original cleanup
      game.cleanup = originalCleanup;
    });

    it('should update current level when transitioning', async () => {
      expect(game.currentLevel).toBe('level_1');

      await game.transitionToLevel('level_3');

      expect(game.currentLevel).toBe('level_3');
      expect(game.gameState.getCurrentZoneId()).toBe('zone_4');
    });

    it('should update UI button state when transitioning', async () => {
      // Mock the level button elements
      const mockLevel1Button = { classList: { add: jest.fn(), remove: jest.fn() } };
      const mockLevel3Button = { classList: { add: jest.fn(), remove: jest.fn() } };

      // eslint-disable-next-line no-undef
      global.document.getElementById = jest.fn((id) => {
        if (id === 'gameBoard') return mockGameBoard;
        if (id === 'level_1') return mockLevel1Button;
        if (id === 'level_3') return mockLevel3Button;
        return null;
      });

      await game.transitionToLevel('level_3');

      // Should remove active class from all buttons
      // eslint-disable-next-line no-undef
      expect(global.document.querySelectorAll).toHaveBeenCalledWith('.level-btn');

      // Should add active class to level_3 button
      expect(mockLevel3Button.classList.add).toHaveBeenCalledWith('active');
    });
  });

  describe('Final Level Handling', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_5' });
    });

    it('should handle game completion at final level', () => {
      expect(game.currentLevel).toBe('level_5');

      // Complete all zones in final level
      const totalZones = game.gameState.getTotalZones();
      for (let i = 0; i < totalZones; i++) {
        const keys = game.gameState.availableKeys;
        keys.forEach((key) => {
          game.gameState.collectKey(key);
        });

        if (i < totalZones - 1) {
          game.gameState.progressToNextZone();
        }
      }

      const gate = game.gameState.getGate();
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      // Should complete game, not progress to next level
      expect(game.gameState.isGameComplete()).toBe(true);
      expect(game.gameState.shouldProgressToNextLevel()).toBe(false);
    });
  });
});
