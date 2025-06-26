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
      expect(tile.name).toBe('path'); // Cursor now starts on main pathway (row 1)
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
      expect(textLabels).toHaveLength(27); // Updated for individual character labels (5+6+7+5+4=27)

      // Check that the individual characters for "Hello world!" are present
      const textContents = textLabels.map((label) => label.text);
      expect(textContents).toContain('H');
      expect(textContents).toContain('e');
      expect(textContents).toContain('l');
      expect(textContents).toContain('o');
      expect(textContents).toContain('w');
      expect(textContents).toContain('!');
    });

    it('should have a closed gate initially', () => {
      const gate = game.gameState.getGate();
      expect(gate.isOpen).toBe(false);
      // Note: In BlinkingGrove Zone system, gate walkability is handled by the gate itself, not map
      expect(gate.isWalkable()).toBe(false);
    });
  });

  describe('Movement Mechanics', () => {
    it('should allow movement with h,j,k,l keys', () => {
      const startPosition = game.gameState.cursor.position;

      // Test h (left) - position (1,1) is at the left edge, can't move further left
      game.movePlayerUseCase.execute('left');
      expect(game.gameState.cursor.position).toHavePosition(startPosition.x, startPosition.y); // Should stay in place

      // Test l (right) - move right twice from start position
      game.movePlayerUseCase.execute('right');
      game.movePlayerUseCase.execute('right');
      expect(game.gameState.cursor.position).toHavePosition(startPosition.x + 2, startPosition.y);

      // Test j (down)
      game.movePlayerUseCase.execute('down');
      expect(game.gameState.cursor.position).toHavePosition(
        startPosition.x + 2,
        startPosition.y + 1
      );

      // Test k (up)
      game.movePlayerUseCase.execute('up');
      expect(game.gameState.cursor.position).toHavePosition(startPosition.x + 2, startPosition.y);
    });

    it('should prevent movement into tree obstacle', () => {
      // Find tree position
      let treePosition = null;
      for (let y = 0; y < game.gameState.map.size; y++) {
        for (let x = 0; x < game.gameState.map.size; x++) {
          const pos = new Position(x, y);
          if (!game.gameState.map.isWalkable(pos)) {
            const tile = game.gameState.map.getTileAt(pos);
            if (tile.name === 'tree') {
              treePosition = pos;
              break;
            }
          }
        }
        if (treePosition) break;
      }

      expect(treePosition).toBeTruthy();
      expect(game.gameState.map.isWalkable(treePosition)).toBe(false);
    });

    it('should prevent movement outside grid boundaries', () => {
      // Move to top-left corner area and try to go out of bounds
      const cursor = game.gameState.cursor;

      // Try to move beyond left border
      for (let i = 0; i < 10; i++) {
        game.movePlayerUseCase.execute('left');
      }
      expect(cursor.position.x).toBeGreaterThanOrEqual(0);

      // Try to move beyond top border
      for (let i = 0; i < 10; i++) {
        game.movePlayerUseCase.execute('up');
      }
      expect(cursor.position.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Key Collection', () => {
    it('should collect movement keys when player moves to their positions', () => {
      const hKey = game.gameState.availableKeys.find((key) => key.key === 'h');
      expect(hKey).toBeTruthy();

      // Navigate to h key
      const targetPos = hKey.position;
      const cursorPos = game.gameState.cursor.position;

      // Move to key position (simplified navigation)
      const deltaX = targetPos.x - cursorPos.x;
      const deltaY = targetPos.y - cursorPos.y;

      // Move horizontally first
      for (let i = 0; i < Math.abs(deltaX); i++) {
        game.movePlayerUseCase.execute(deltaX > 0 ? 'right' : 'left');
      }

      // Move vertically
      for (let i = 0; i < Math.abs(deltaY); i++) {
        game.movePlayerUseCase.execute(deltaY > 0 ? 'down' : 'up');
      }

      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys).toHaveLength(3);
    });

    it('should track progress of key collection', () => {
      expect(game.gameState.collectedKeys.size).toBe(0);

      // Collect keys one by one
      const keys = game.gameState.availableKeys;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        game.gameState.collectKey(key);
        expect(game.gameState.collectedKeys.size).toBe(i + 1);
      }
    });
  });

  describe('Gate Mechanics', () => {
    it('should keep gate closed until all keys are collected', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect 3 out of 4 keys
      for (let i = 0; i < 3; i++) {
        game.gameState.collectKey(keys[i]);
      }

      expect(gate.isOpen).toBe(false);
      expect(gate.isWalkable()).toBe(false);
    });

    it('should open gate after collecting all 4 movement keys', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect all keys
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      expect(gate.isOpen).toBe(true);
      expect(game.gameState.map.isWalkable(gate.position)).toBe(true);
    });

    it('should allow cursor to pass through open gate', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect all keys to open gate
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      // Navigate player to gate position
      const gatePos = gate.position;

      // Move player to gate (simplified)
      game.gameState.cursor = game.gameState.cursor.moveTo(gatePos);

      expect(game.gameState.cursor.position).toEqual(gatePos);
      expect(game.gameState.map.isWalkable(gatePos)).toBe(true);
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
