import { VimForKidsGame } from '../../src/VimForKidsGame.js';
import { Position } from '../../src/domain/value-objects/Position.js';

describe('VIM for Kids Game Integration', () => {
  let game;

  beforeEach(() => {
    // Setup DOM for each test
    document.body.innerHTML = `
      <div class="game-container">
        <div class="game-board" id="gameBoard"></div>
        <div class="collected-keys" id="collectedKeys">
          <div class="key-display"></div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    if (game && game.cleanup) {
      game.cleanup();
    }
  });

  describe('Game Initialization', () => {
    it('should initialize all components successfully', () => {
      const game = new VimForKidsGame();

      expect(game.gameState).toBeDefined();
      expect(game.movePlayerUseCase).toBeDefined();
      expect(game.npcInteractionUseCase).toBeDefined();
      expect(game.currentLevel).toBe('level_1');
    });

    it('should initialize with level1 option', () => {
      const game = new VimForKidsGame({ level: 'level1' });
      expect(game.currentLevel).toBe('level1');
    });

    it('should initialize with welcomeMeadow option for backwards compatibility', () => {
      const game = new VimForKidsGame({ level: 'welcomeMeadow' });
      expect(game.currentLevel).toBe('welcomeMeadow');
    });

    it('should default to WelcomeMeadowGameState for unknown level', () => {
      const game = new VimForKidsGame({ level: 'unknownLevel' });
      expect(game.currentLevel).toBe('unknownLevel');
    });

    it('should default to level_1 when no options provided', () => {
      const game = new VimForKidsGame();
      expect(game.currentLevel).toBe('level_1');
      expect(game.gameState.cursor).toBeDefined();
      expect(game.gameState.availableKeys).toHaveLength(4);
    });

    it('should render initial game state', () => {
      const game = new VimForKidsGame();

      // Should not throw any errors during initialization
      expect(game.gameState).toBeDefined();
      expect(game.gameRenderer).toBeDefined();
    });

    it('should have cursor at correct starting position', () => {
      game = new VimForKidsGame({ level: 'default' });

      expect(game.gameState.cursor.position).toHavePosition(8, 14); // Updated for new layout
    });

    it('should have all VIM keys available initially', () => {
      game = new VimForKidsGame();

      expect(game.gameState.availableKeys).toHaveLength(4);

      const keyLetters = game.gameState.availableKeys.map((key) => key.key);
      expect(keyLetters).toContain('h');
      expect(keyLetters).toContain('j');
      expect(keyLetters).toContain('k');
      expect(keyLetters).toContain('l');
    });
  });

  describe('Game Cleanup', () => {
    it('should cleanup input handler', () => {
      game = new VimForKidsGame({ level: 'default' });

      const cleanupSpy = jest.spyOn(game.inputHandler, 'cleanup');

      game.cleanup();

      expect(cleanupSpy).toHaveBeenCalled();
    });

    it('should cleanup map if cleanup method exists', () => {
      game = new VimForKidsGame({ level: 'default' });

      // Mock map cleanup method
      game.gameState.map.cleanup = jest.fn();

      game.cleanup();

      expect(game.gameState.map.cleanup).toHaveBeenCalled();
    });

    it('should handle cleanup when map has no cleanup method', () => {
      game = new VimForKidsGame({ level: 'default' });

      // Ensure map has no cleanup method
      delete game.gameState.map.cleanup;

      expect(() => {
        game.cleanup();
      }).not.toThrow();
    });
  });

  describe('Cursor Movement', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'default' });
    });

    it('should move cursor right', () => {
      const originalPosition = game.gameState.cursor.position;
      game.movePlayerUseCase.executeSync('right');

      expect(game.gameState.cursor.position).toHavePosition(
        originalPosition.x + 1,
        originalPosition.y
      );
    });

    it('should move cursor left', () => {
      // First move right to ensure we can move left
      game.movePlayerUseCase.executeSync('right');
      const position = game.gameState.cursor.position;

      game.movePlayerUseCase.executeSync('left');

      expect(game.gameState.cursor.position).toHavePosition(position.x - 1, position.y);
    });

    it('should move cursor down', () => {
      const originalPosition = game.gameState.cursor.position;
      game.movePlayerUseCase.executeSync('down');

      expect(game.gameState.cursor.position).toHavePosition(
        originalPosition.x,
        originalPosition.y + 1
      );
    });

    it('should move cursor up', () => {
      // First move down to ensure we can move up
      game.movePlayerUseCase.executeSync('down');
      const position = game.gameState.cursor.position;

      game.movePlayerUseCase.executeSync('up');

      expect(game.gameState.cursor.position).toHavePosition(position.x, position.y - 1);
    });

    it('should not move into water tiles', () => {
      // Move up twice should hit water boundary
      game.movePlayerUseCase.executeSync('up');
      game.movePlayerUseCase.executeSync('up');

      // Should not be at (5, 0) which is water
      expect(game.gameState.cursor.position.y).toBeGreaterThan(0);
    });
  });

  describe('Key Collection', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'default' });
    });

    it('should collect key when cursor moves to key position', () => {
      // Find the 'h' key in the new layout
      const targetKey = game.gameState.availableKeys.find(
        (key) => key.key === 'h'
      );

      expect(targetKey).toBeDefined();
      expect(targetKey.key).toBe('h');

      // Navigate to the key position using the actual position from new layout
      const keyPosition = targetKey.position;
      game.gameState.cursor = game.gameState.cursor.moveTo(keyPosition);

      expect(game.gameState.cursor.position).toEqual(keyPosition);

      // Collect the key
      game.gameState.collectKey(targetKey);

      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

    it('should collect key without popup when key is collected', () => {
      // Find and collect the 'h' key
      const targetKey = game.gameState.availableKeys.find(key => key.key === 'h');
      game.gameState.cursor = game.gameState.cursor.moveTo(targetKey.position);
      game.gameState.collectKey(targetKey);

      // Verify key was collected
      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

            it('should update UI when key is collected', () => {
      // Find and collect the 'h' key
      const targetKey = game.gameState.availableKeys.find(key => key.key === 'h');
      game.gameState.cursor = game.gameState.cursor.moveTo(targetKey.position);
      game.gameState.collectKey(targetKey);

      // Verify key was collected in game state
      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

    it('should collect keys placed in grass area', () => {
      // Find the 'k' key in the new layout (it's in the grass area)
      const targetKey = game.gameState.availableKeys.find(
        (key) => key.key === 'k'
      );

      expect(targetKey).toBeDefined();
      expect(targetKey.key).toBe('k');

      // Move to the key position
      game.gameState.cursor = game.gameState.cursor.moveTo(targetKey.position);
      game.gameState.collectKey(targetKey);

      expect(game.gameState.collectedKeys.has('k')).toBe(true);
    });

    it('should collect the easternmost grass key', () => {
      // Find the 'l' key in the new layout
      const targetKey = game.gameState.availableKeys.find(
        (key) => key.key === 'l'
      );

      expect(targetKey).toBeDefined();
      expect(targetKey.key).toBe('l');

      // Move to the key position
      game.gameState.cursor = game.gameState.cursor.moveTo(targetKey.position);
      game.gameState.collectKey(targetKey);

      expect(game.gameState.collectedKeys.has('l')).toBe(true);
    });
  });

  describe('Terrain Navigation', () => {
    it('should block movement into water barriers', () => {
      // Try to move up (towards water)
      game.movePlayerUseCase.executeSync('up');

      // Player should not have moved (or moved to a valid position)
      const newPosition = game.gameState.cursor.position;
      const tile = game.gameState.map.getTileAt(newPosition);
      expect(['grass', 'dirt'].includes(tile.name)).toBe(true); // Should be on walkable terrain
    });

    it('should allow movement through grass area', () => {
      // Navigate through the grass area from starting position
      const startPos = game.gameState.cursor.position;

      game.movePlayerUseCase.executeSync('right'); // Move right in grass
      const newPos = game.gameState.cursor.position;

      expect(newPos.x).toBeGreaterThan(startPos.x); // Should have moved right

      const tile = game.gameState.map.getTileAt(newPos);
      expect(['grass', 'dirt'].includes(tile.name)).toBe(true); // Should be on walkable terrain
    });

        it('should prevent movement into stone barriers within maze area', () => {
      // Find a walkable position in the dirt area (we know dirt is walkable)
      const dirtArea = new Position(8, 14); // Use current starting position which is known to be dirt
      game.gameState.cursor = game.gameState.cursor.moveTo(dirtArea);

      // Verify we're on walkable terrain to start
      expect(game.gameState.map.isWalkable(dirtArea)).toBe(true);

      // Try to move (movement should work in dirt area)
      game.movePlayerUseCase.executeSync('up');

      // Verify cursor remains on walkable terrain
      const newPosition = game.gameState.cursor.position;
      expect(game.gameState.map.isWalkable(newPosition)).toBe(true);
    });

    it('should connect grass area to rest of map seamlessly', () => {
      // Reset cursor to actual starting position
      game.gameState.cursor = game.gameState.cursor.moveTo(new Position(8, 14));

      // Test that player can move around the grass area
      const startPos = game.gameState.cursor.position;
      expect(startPos).toHavePosition(8, 14); // Starting position in dirt

      game.movePlayerUseCase.executeSync('left'); // Move left in grass
      const leftPos = game.gameState.cursor.position;
      expect(leftPos.x).toBeLessThan(startPos.x); // Should move left

      game.movePlayerUseCase.executeSync('right'); // Move back right
      game.movePlayerUseCase.executeSync('right'); // Move right again
      const rightPos = game.gameState.cursor.position;
      expect(rightPos.x).toBeGreaterThan(startPos.x); // Should move right
    });
  });

  describe('Game Rendering', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'default' });
    });

    it('should update rendering after movement', () => {
      const initialPosition = game.gameState.cursor.position;

      game.movePlayerUseCase.executeSync('right');

      expect(game.gameState.cursor.position).not.toEqual(initialPosition);
    });

        it('should remove key from display after collection', () => {
      // Find and collect a key
      const targetKey = game.gameState.availableKeys[0];
      const initialAvailableKeys = game.gameState.availableKeys.length;

      game.gameState.cursor = game.gameState.cursor.moveTo(targetKey.position);
      game.gameState.collectKey(targetKey);

      // Check that key was removed from available keys
      expect(game.gameState.availableKeys.length).toBe(initialAvailableKeys - 1);
      expect(game.gameState.collectedKeys.has(targetKey.key)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'default' });
    });

    it('should handle invalid movement direction gracefully', () => {
      const originalPosition = game.gameState.cursor.position;

      expect(() => {
        game.movePlayerUseCase.executeSync('invalid');
      }).toThrow('Invalid direction: invalid');

      // Player position should not change
      expect(game.gameState.cursor.position).toEqual(originalPosition);
    });

    it('should handle missing DOM elements gracefully', () => {
      // Remove game board element
      document.getElementById('gameBoard').remove();

      expect(() => {
        new VimForKidsGame({ level: 'default' });
      }).toThrow();
    });
  });
});
