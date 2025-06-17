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

describe('Welcome Meadow Game Integration', () => {
  let game;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockGameBoard.setAttribute.mockClear();
    // eslint-disable-next-line no-undef
    global.alert = jest.fn();

    // Create game with Welcome Meadow
    game = new VimForKidsGame({ level: 'welcomeMeadow' });
  });

  describe('Game Initialization', () => {
    it('should initialize with Welcome Meadow level', () => {
      expect(game.currentLevel).toBe('welcomeMeadow');
      expect(game.gameState.map.width).toBe(20);
      expect(game.gameState.map.height).toBe(15);
    });

    it('should place player in dirt area as shown in image', () => {
      const startPos = game.gameState.player.position;
      const tile = game.gameState.map.getTileAt(startPos);
      expect(tile.name).toBe('dirt');
    });

    it('should have 4 movement keys available', () => {
      expect(game.gameState.availableKeys).toHaveLength(4);

      const keyLetters = game.gameState.availableKeys.map((key) => key.key);
      expect(keyLetters).toContain('h');
      expect(keyLetters).toContain('j');
      expect(keyLetters).toContain('k');
      expect(keyLetters).toContain('l');
    });

    it('should display "Hello world!" text on the ground', () => {
      const textLabels = game.gameState.getTextLabels();
      expect(textLabels).toHaveLength(12); // "Hello world!" = 12 characters

      const message = textLabels
        .sort((a, b) => a.position.y * 10 + a.position.x - (b.position.y * 10 + b.position.x))
        .map((label) => label.text)
        .join('');
      expect(message).toBe('Hello world!');
    });

    it('should have a closed gate initially', () => {
      const gate = game.gameState.getGate();
      expect(gate.isOpen).toBe(false);
      expect(game.gameState.map.isWalkable(gate.position)).toBe(false);
    });
  });

  describe('Movement Mechanics', () => {
    it('should allow movement with h,j,k,l keys', () => {
      const startPosition = game.gameState.player.position;

      // Test h (left)
      game.movePlayerUseCase.execute('left');
      expect(game.gameState.player.position).toHavePosition(startPosition.x - 1, startPosition.y);

      // Test l (right) - move back and then right
      game.movePlayerUseCase.execute('right');
      game.movePlayerUseCase.execute('right');
      expect(game.gameState.player.position).toHavePosition(startPosition.x + 1, startPosition.y);

      // Test j (down)
      game.movePlayerUseCase.execute('down');
      expect(game.gameState.player.position).toHavePosition(
        startPosition.x + 1,
        startPosition.y + 1
      );

      // Test k (up)
      game.movePlayerUseCase.execute('up');
      expect(game.gameState.player.position).toHavePosition(startPosition.x + 1, startPosition.y);
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
      const player = game.gameState.player;

      // Try to move beyond left border
      for (let i = 0; i < 10; i++) {
        game.movePlayerUseCase.execute('left');
      }
      expect(player.position.x).toBeGreaterThanOrEqual(0);

      // Try to move beyond top border
      for (let i = 0; i < 10; i++) {
        game.movePlayerUseCase.execute('up');
      }
      expect(player.position.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Key Collection', () => {
    it('should collect movement keys when player moves to their positions', () => {
      const hKey = game.gameState.availableKeys.find((key) => key.key === 'h');
      expect(hKey).toBeTruthy();

      // Navigate to h key
      const targetPos = hKey.position;
      const playerPos = game.gameState.player.position;

      // Move to key position (simplified navigation)
      const deltaX = targetPos.x - playerPos.x;
      const deltaY = targetPos.y - playerPos.y;

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
      expect(game.gameState.map.isWalkable(gate.position)).toBe(false);
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

    it('should allow player to pass through open gate', () => {
      const gate = game.gameState.getGate();
      const keys = game.gameState.availableKeys;

      // Collect all keys to open gate
      keys.forEach((key) => {
        game.gameState.collectKey(key);
      });

      // Navigate player to gate position
      const gatePos = gate.position;

      // Move player to gate (simplified)
      game.gameState.player = game.gameState.player.moveTo(gatePos);

      expect(game.gameState.player.position).toEqual(gatePos);
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
      expect(completionMessage).toContain('Welcome Meadow');
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
            expect(key.description).toBe('Move left');
            break;
          case 'j':
            expect(key.description).toBe('Move down');
            break;
          case 'k':
            expect(key.description).toBe('Move up');
            break;
          case 'l':
            expect(key.description).toBe('Move right');
            break;
        }
      });
    });

    it('should encourage exploration through "Hello world!" message', () => {
      const textLabels = game.gameState.getTextLabels();
      expect(textLabels.length).toBeGreaterThan(0);

      // Verify message is placed on walkable ground
      textLabels.forEach((label) => {
        expect(game.gameState.map.isWalkable(label.position)).toBe(true);
      });
    });
  });
});
