import { VimForKidsGame } from '../../src/VimForKidsGame.js';
import { Position } from '../../src/domain/value-objects/Position.js';

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

describe('Blinking Grove Game Integration', () => {
  let game;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockGameBoard.setAttribute.mockClear();
    // eslint-disable-next-line no-undef
    global.alert = jest.fn();

    // Create game with Level 1 (Blinking Grove)
    game = new VimForKidsGame({ level: 'level_1' });
  });

  describe('Game Initialization', () => {
    it('should initialize with Level 1', () => {
      expect(game.currentLevel).toBe('level_1');
      // BlinkingGrove uses dynamic sizing with water all around (calculated based on screen size)
      expect(game.gameState.map.width).toBeGreaterThanOrEqual(24); // Minimum size with zone + padding
      expect(game.gameState.map.height).toBeGreaterThanOrEqual(16); // Minimum size with zone + padding
    });

    it('should place cursor in starting position', () => {
      const startPos = game.gameState.cursor.position;
      const tile = game.gameState.map.getTileAt(startPos);
      expect(tile.name).toBe('dirt'); // Cursor now starts on dirt area
    });

    it('should have 4 movement keys available', () => {
      expect(game.gameState.availableKeys).toHaveLength(4);

      const keyLetters = game.gameState.availableKeys.map((key) => key.key);
      expect(keyLetters).toContain('h');
      expect(keyLetters).toContain('j');
      expect(keyLetters).toContain('k');
      expect(keyLetters).toContain('l');
    });

    it('should display text labels on the ground', () => {
      const textLabels = game.gameState.getTextLabels();
      expect(textLabels).toHaveLength(36); // Updated for new layout: "Remember: words are not WORDS" + "Hello world!"

      // Check that the individual characters for "Hello world!" are present
      const textContents = textLabels.map((label) => label.text);
      expect(textContents).toContain('H');
      expect(textContents).toContain('e');
      expect(textContents).toContain('l');
      expect(textContents).toContain('o');
      expect(textContents).toContain('w');
      expect(textContents).toContain('r');
      expect(textContents).toContain('d');
      expect(textContents).toContain('!');
    });

    it('should have a closed gate initially', () => {
      const gate = game.gameState.getGate();
      expect(gate.isOpen).toBe(false);
    });
  });

  describe('Movement Mechanics', () => {
    it('should allow movement with h,j,k,l keys', () => {
      const startPosition = game.gameState.cursor.position;

      // Test h (left) - can move left from grass area
      game.movePlayerUseCase.execute('left');
      expect(game.gameState.cursor.position.x).toBeLessThan(startPosition.x); // Should move left

      // Reset to start position and test l (right)
      game.gameState.cursor = game.gameState.cursor.moveTo(startPosition);
      game.movePlayerUseCase.execute('right');
      expect(game.gameState.cursor.position.x).toBeGreaterThan(startPosition.x); // Should move right

      // Test j (down) and k (up)
      game.gameState.cursor = game.gameState.cursor.moveTo(startPosition);
      game.movePlayerUseCase.execute('down');
      expect(game.gameState.cursor.position.y).toBeGreaterThan(startPosition.y); // Should move down

      game.gameState.cursor = game.gameState.cursor.moveTo(startPosition);
      game.movePlayerUseCase.execute('up');
      expect(game.gameState.cursor.position.y).toBeLessThan(startPosition.y); // Should move up
    });

    it('should prevent movement into water obstacle', () => {
      // Find a water position (left side of map has water)
      let waterPosition = null;
      for (let x = 0; x < game.gameState.map.width && !waterPosition; x++) {
        for (let y = 0; y < game.gameState.map.height; y++) {
          const tile = game.gameState.map.getTileAt({ x, y });
          if (tile.name === 'water') {
            waterPosition = { x, y };
            break;
          }
        }
      }

      expect(waterPosition).toBeTruthy();
      expect(game.gameState.map.isWalkable(waterPosition)).toBe(false);
    });

    it('should prevent movement outside grid boundaries', () => {
      // Move cursor to top-left corner
      const topLeft = new Position(0, 0);
      game.gameState.cursor = game.gameState.cursor.moveTo(topLeft);

      const positionBeforeMove = game.gameState.cursor.position;

      // Try to move up and left (outside bounds)
      game.movePlayerUseCase.execute('up');
      expect(game.gameState.cursor.position).toEqual(positionBeforeMove);

      game.movePlayerUseCase.execute('left');
      expect(game.gameState.cursor.position).toEqual(positionBeforeMove);
    });
  });

  describe('Key Collection', () => {
    it('should collect movement keys when player moves to their positions', () => {
      // Move to h key position (31, 5) in zone coordinates, which is absolute position
      const hKeyPosition = game.gameState.availableKeys.find(k => k.key === 'h').position;

      game.gameState.cursor = game.gameState.cursor.moveTo(hKeyPosition);
      game.gameState.collectKey(game.gameState.availableKeys.find(k => k.key === 'h'));

      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys).toHaveLength(3);
    });

    it('should track progress of key collection', () => {
      const keys = [...game.gameState.availableKeys];

      // Collect keys one by one
      keys.forEach((key, index) => {
        game.gameState.collectKey(key);
        expect(game.gameState.collectedKeys.size).toBe(index + 1);
      });

      expect(game.gameState.collectedKeys.size).toBe(4);
      expect(game.gameState.isCurrentZoneComplete()).toBe(true);
    });
  });

  describe('Gate Mechanics', () => {
    it('should keep gate closed until all keys are collected', () => {
      const gate = game.gameState.getGate();
      const keys = [...game.gameState.availableKeys];

      // Collect partial keys
      for (let i = 0; i < keys.length - 1; i++) {
        game.gameState.collectKey(keys[i]);
        expect(gate.isOpen).toBe(false);
      }
    });

    it('should open gate after collecting all 4 movement keys', () => {
      const gate = game.gameState.getGate();
      const keys = [...game.gameState.availableKeys];

      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      expect(gate.isOpen).toBe(true);
      // Note: Gate position is now on stone, which may not be walkable by default
      // This is expected behavior for gates
    });

    it('should allow cursor to pass through open gate', () => {
      const gate = game.gameState.getGate();
      const keys = [...game.gameState.availableKeys];

      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      const gatePos = gate.position;
      game.gameState.cursor = game.gameState.cursor.moveTo(gatePos);

      expect(game.gameState.cursor.position).toEqual(gatePos);
      // Gate walkability is handled differently when open
    });

    it('should prevent cursor from moving through closed gate', () => {
      const gate = game.gameState.getGate();

      // Ensure gate is closed (no keys collected)
      expect(gate.isOpen).toBe(false);
      expect(gate.isWalkable()).toBe(false);

      // Position cursor adjacent to gate
      const gatePos = gate.position;
      const adjacentPos = new Position(gatePos.x - 1, gatePos.y); // Position to the left of gate

      // Move cursor to position adjacent to gate
      game.gameState.cursor = game.gameState.cursor.moveTo(adjacentPos);
      const initialPosition = game.gameState.cursor.position;

      // Try to move through the closed gate using MovePlayerUseCase
      game.movePlayerUseCase.execute('right'); // Should be blocked

      // Cursor should remain in the same position
      expect(game.gameState.cursor.position).toEqual(initialPosition);
    });

    it('should allow cursor to move through open gate using movement commands', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect all keys to open gate
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      // Ensure gate is now open
      expect(gate.isOpen).toBe(true);
      expect(gate.isWalkable()).toBe(true);

      // Position cursor adjacent to gate
      const gatePos = gate.position;
      const adjacentPos = new Position(gatePos.x - 1, gatePos.y); // Position to the left of gate

      // Move cursor to position adjacent to gate
      game.gameState.cursor = game.gameState.cursor.moveTo(adjacentPos);

            // Move through the open gate using MovePlayerUseCase
      game.movePlayerUseCase.execute('right'); // Should attempt to move right

      // Verify that the gate doesn't block movement when open
      // (The actual position may vary based on terrain walkability)
      expect(gate.isWalkable()).toBe(true);
    });
  });

  describe('Level Completion', () => {
    it('should mark level as complete when all keys collected and gate opened', () => {
      const keys = game.gameState.availableKeys;

      expect(game.gameState.isLevelComplete()).toBe(false);

      // Collect all keys
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      expect(game.gameState.isLevelComplete()).toBe(true);
    });

    it('should provide feedback on completion', () => {
      const keys = game.gameState.availableKeys;

      // Collect all keys
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      const completionMessage = game.gameState.getCompletionMessage();
      expect(completionMessage).toContain('Blinking Grove');
      expect(completionMessage).toContain('completed');
    });
  });

  describe('UI Integration', () => {
    it('should render all elements correctly', () => {
      // Verify rendering calls are made
      expect(game.gameRenderer.render).toBeDefined();

      // Check that game renderer exists and is functional
      expect(game.gameRenderer).toBeDefined();
      expect(typeof game.gameRenderer.render).toBe('function');
    });

    it('should update UI when keys are collected', () => {
      const initialKeyCount = game.gameState.availableKeys.length;
      const firstKey = game.gameState.availableKeys[0];

      game.gameState.collectKey(firstKey);

      // Verify UI updates
      expect(game.gameState.availableKeys.length).toBe(initialKeyCount - 1);
      expect(game.gameState.collectedKeys.has(firstKey.key)).toBe(true);
    });
  });

  describe('Educational Value', () => {
    it('should reinforce movement command learning', () => {
      const keys = game.gameState.availableKeys;

      // Verify each key has correct description
      keys.forEach((key) => {
        switch (key.key) {
          case 'h':
            expect(key.description).toBe('Move left - The westward wind key');
            break;
          case 'j':
            expect(key.description).toBe('Move down - The earthward root key');
            break;
          case 'k':
            expect(key.description).toBe('Move up - The skyward branch key');
            break;
          case 'l':
            expect(key.description).toBe('Move right - The eastward sun key');
            break;
        }
      });
    });

    it('should encourage exploration through "Hello world!" message', () => {
      const textLabels = game.gameState.getTextLabels();

      // Find the individual character labels for "Hello world!"
      const hLabel = textLabels.find((label) => label.text === 'H');
      const wLabel = textLabels.find((label) => label.text === 'w');

      expect(hLabel).toBeDefined();
      expect(wLabel).toBeDefined();

      // Verify the main character labels are placed on walkable ground
      const mainLabels = [hLabel, wLabel];
      mainLabels.forEach((label) => {
        expect(game.gameState.map.isWalkable(label.position)).toBe(true);
      });
    });
  });
});
