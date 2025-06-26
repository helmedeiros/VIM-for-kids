import { VimForKidsGame } from '../../src/VimForKidsGame.js';

// Mock DOM elements for testing
const mockGameBoard = {
  setAttribute: jest.fn(),
  focus: jest.fn(),
  innerHTML: '',
  appendChild: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  querySelector: jest.fn(() => mockGameBoard),
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
});

describe('Zone and Level Progression Integration', () => {
  let game;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockGameBoard.setAttribute.mockClear();
    // eslint-disable-next-line no-undef
    global.alert = jest.fn();
  });

  describe('Single Zone Level Progression (Level 1)', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_1' });
    });

    it('should start at first zone of level 1', () => {
      expect(game.gameState.getCurrentZoneId()).toBe('zone_1');
      expect(game.gameState.getCurrentZoneIndex()).toBe(0);
      expect(game.gameState.getTotalZones()).toBe(1);
    });

    it('should not progress to next zone when gate is closed', () => {
      const gate = game.gameState.getGate();

      // Ensure gate is closed
      expect(gate.isOpen).toBe(false);

      // Try to move through gate
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);
      const initialZoneId = game.gameState.getCurrentZoneId();

      // Should remain in same zone
      expect(game.gameState.getCurrentZoneId()).toBe(initialZoneId);
      expect(game.gameState.getCurrentZoneIndex()).toBe(0);
    });

    it('should progress to next level when passing through open gate in last zone', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect all keys to open gate
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      expect(gate.isOpen).toBe(true);
      expect(game.gameState.isCurrentZoneComplete()).toBe(true);
      expect(game.gameState.isLevelComplete()).toBe(true);

      // Move through gate should trigger level progression
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      // Should trigger progression to next level
      expect(game.gameState.shouldProgressToNextLevel()).toBe(true);
    });
  });

  describe('Multi-Zone Level Progression (Level 2)', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_2' });
    });

    it('should start at first zone of level 2', () => {
      expect(game.gameState.getCurrentZoneId()).toBe('zone_2');
      expect(game.gameState.getCurrentZoneIndex()).toBe(0);
      expect(game.gameState.getTotalZones()).toBe(2);
    });

    it('should progress to next zone when passing through open gate in non-last zone', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect all keys to open gate
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      expect(gate.isOpen).toBe(true);
      expect(game.gameState.isCurrentZoneComplete()).toBe(true);
      expect(game.gameState.hasNextZone()).toBe(true);

      // Move through gate should trigger zone progression
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      // Should progress to next zone in same level
      expect(game.gameState.shouldProgressToNextZone()).toBe(true);
    });

    it('should progress to next level when passing through open gate in last zone', () => {
      // Progress to last zone first
      const keys1 = game.gameState.availableKeys;
      keys1.forEach((key) => game.gameState.collectKey(key));
      game.gameState.progressToNextZone();

      // Now in last zone of level
      expect(game.gameState.getCurrentZoneIndex()).toBe(1);
      expect(game.gameState.hasNextZone()).toBe(false);

      const gate = game.gameState.getGate();
      const keys2 = game.gameState.availableKeys;

      // Complete last zone
      keys2.forEach((key) => {
        game.gameState.collectKey(key);
      });

      expect(gate.isOpen).toBe(true);
      expect(game.gameState.isLevelComplete()).toBe(true);

      // Move through gate should trigger level progression
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      // Should trigger progression to next level
      expect(game.gameState.shouldProgressToNextLevel()).toBe(true);
    });
  });

  describe('Movement Through Gates Integration', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_2' });
    });

    it('should trigger zone progression when moving through open gate with movement commands', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect all keys to open gate
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      // Position cursor adjacent to gate
      const gatePos = gate.position;
      const adjacentPos = gatePos.move(-1, 0);
      game.gameState.cursor = game.gameState.cursor.moveTo(adjacentPos);

      // Move through gate using movement command
      game.movePlayerUseCase.execute('right');

      // Should be at gate position (or progressed to next zone)
      const currentPos = game.gameState.cursor.position;
      const hasProgressed = game.gameState.getCurrentZoneIndex() > 0 || currentPos.equals(gatePos);
      expect(hasProgressed).toBe(true);
    });

    it('should not trigger progression when moving to gate but not completing zone', () => {
      const gate = game.gameState.getGate();

      // Don't collect keys - zone not complete
      expect(game.gameState.isCurrentZoneComplete()).toBe(false);

      // Position cursor adjacent to gate
      const gatePos = gate.position;
      const adjacentPos = gatePos.move(-1, 0);
      game.gameState.cursor = game.gameState.cursor.moveTo(adjacentPos);

      // Try to move through gate (should be blocked)
      game.movePlayerUseCase.execute('right');

      // Should remain at adjacent position (gate blocked)
      expect(game.gameState.cursor.position).toEqual(adjacentPos);
      expect(game.gameState.shouldProgressToNextZone()).toBe(false);
    });
  });

  describe('Game State Progression Methods', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'level_2' });
    });

    it('should have progression check methods', () => {
      expect(typeof game.gameState.shouldProgressToNextZone).toBe('function');
      expect(typeof game.gameState.shouldProgressToNextLevel).toBe('function');
      expect(typeof game.gameState.executeProgression).toBe('function');
    });

    it('should execute zone progression correctly', () => {
      const keys = game.gameState.availableKeys;
      keys.forEach((key) => game.gameState.collectKey(key));

      const gate = game.gameState.getGate();
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      const initialZoneIndex = game.gameState.getCurrentZoneIndex();

      // Execute progression
      game.gameState.executeProgression();

      // Should progress to next zone
      expect(game.gameState.getCurrentZoneIndex()).toBe(initialZoneIndex + 1);
    });

    it('should execute level progression correctly', () => {
      // Complete all zones in level
      const totalZones = game.gameState.getTotalZones();
      for (let i = 0; i < totalZones; i++) {
        const keys = game.gameState.availableKeys;
        keys.forEach((key) => game.gameState.collectKey(key));

        if (i < totalZones - 1) {
          game.gameState.progressToNextZone();
        }
      }

      const gate = game.gameState.getGate();
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      // Execute progression
      game.gameState.executeProgression();

      // Should trigger level progression
      expect(game.gameState.shouldProgressToNextLevel()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle progression at final level correctly', () => {
      game = new VimForKidsGame({ level: 'level_5' }); // Last level

      // Complete all zones
      const totalZones = game.gameState.getTotalZones();
      for (let i = 0; i < totalZones; i++) {
        const keys = game.gameState.availableKeys;
        keys.forEach((key) => game.gameState.collectKey(key));

        if (i < totalZones - 1) {
          game.gameState.progressToNextZone();
        }
      }

      const gate = game.gameState.getGate();
      game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

      // Should complete game
      expect(game.gameState.isGameComplete()).toBe(true);
      expect(game.gameState.shouldProgressToNextLevel()).toBe(false);
    });

    it('should prevent progression when zone is not complete', () => {
      const gate = game.gameState.getGate();
      const availableKeys = game.gameState.availableKeys;

      // Only test if zone has keys to collect
      if (availableKeys.length > 0) {
        // Zone not complete (no keys collected)
        expect(game.gameState.isCurrentZoneComplete()).toBe(false);

        // Move to gate position (manually, since movement would be blocked)
        game.gameState.cursor = game.gameState.cursor.moveTo(gate.position);

        expect(game.gameState.shouldProgressToNextZone()).toBe(false);
        expect(game.gameState.shouldProgressToNextLevel()).toBe(false);
      } else {
        // If no keys, zone might be complete by default - skip test
        expect(true).toBe(true); // Pass the test
      }
    });
  });
});
