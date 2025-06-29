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
      game = new VimForKidsGame({ level: 'default' });

      expect(game.gameState).toBeDefined();
      expect(game.gameRenderer).toBeDefined();
      expect(game.inputHandler).toBeDefined();
      expect(game.movePlayerUseCase).toBeDefined();
    });

    it('should initialize with level1 option', () => {
      game = new VimForKidsGame({ level: 'level1' });

      expect(game.gameState).toBeDefined();
      expect(game.currentLevel).toBe('level1');
    });

    it('should initialize with welcomeMeadow option for backwards compatibility', () => {
      game = new VimForKidsGame({ level: 'welcomeMeadow' });

      expect(game.gameState).toBeDefined();
      expect(game.currentLevel).toBe('welcomeMeadow');
    });

    it('should default to WelcomeMeadowGameState for unknown level', () => {
      game = new VimForKidsGame({ level: 'unknownLevel' });

      expect(game.gameState).toBeDefined();
      expect(game.currentLevel).toBe('unknownLevel');
    });

    it('should default to level_1 when no options provided', () => {
      game = new VimForKidsGame();

      expect(game.gameState).toBeDefined();
      expect(game.currentLevel).toBe('level_1');
    });

    it('should render initial game state', () => {
      game = new VimForKidsGame({ level: 'default' });

      const gameBoard = document.getElementById('gameBoard');
      const tiles = gameBoard.querySelectorAll('.tile');

      // Camera system renders viewport-sized grid (not fixed 12x12)
      expect(tiles.length).toBeGreaterThan(100); // Should render many tiles for viewport

      // Should have cursor tile
      const cursorTiles = gameBoard.querySelectorAll('.tile.cursor');
      expect(cursorTiles.length).toBe(1);

      // Should have visible VIM key tiles (only those in viewport)
      const keyTiles = gameBoard.querySelectorAll('.tile.key');
      expect(keyTiles.length).toBeGreaterThanOrEqual(1); // At least one key should be visible
      expect(keyTiles.length).toBeLessThanOrEqual(4); // At most all 4 keys
    });

    it('should have cursor at correct starting position', () => {
      game = new VimForKidsGame({ level: 'default' });

      expect(game.gameState.cursor.position).toHavePosition(7, 10);
    });

    it('should have all VIM keys available initially', () => {
      game = new VimForKidsGame({ level: 'default' });

      expect(game.gameState.availableKeys).toHaveLength(4);
      expect(game.gameState.collectedKeys.size).toBe(0);

      const keyNames = game.gameState.availableKeys.map((key) => key.key);
      expect(keyNames).toContain('h');
      expect(keyNames).toContain('j');
      expect(keyNames).toContain('k');
      expect(keyNames).toContain('l');
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
      // Move to a key position (8, 12) where 'h' key is located
      const targetKey = game.gameState.availableKeys.find((key) =>
        key.position.equals(new Position(8, 12))
      );

      expect(targetKey).toBeDefined();
      expect(targetKey.key).toBe('h');

      // Navigate to the key position
      // From (7,10) to (8,12): right 1, down 2
      game.movePlayerUseCase.executeSync('right');
      game.movePlayerUseCase.executeSync('down');
      game.movePlayerUseCase.executeSync('down');

      expect(game.gameState.cursor.position).toHavePosition(8, 12);
      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

    it('should collect key without popup when key is collected', () => {
      // Navigate to key position and verify key is collected
      game.movePlayerUseCase.executeSync('right');
      game.movePlayerUseCase.executeSync('down');
      game.movePlayerUseCase.executeSync('down');

      // Verify key was collected
      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

    it('should update UI when key is collected', () => {
      // Collect a key
      game.movePlayerUseCase.executeSync('right');
      game.movePlayerUseCase.executeSync('down');
      game.movePlayerUseCase.executeSync('down');

      // Check that key display is updated
      const keyDisplay = document.querySelector('.key-display');
      const collectedKeyElements = keyDisplay.querySelectorAll('.collected-key');

      expect(collectedKeyElements.length).toBe(1);
      expect(collectedKeyElements[0].textContent).toBe('h');
    });

    it('should collect keys placed in forest paths', () => {
      // Test collecting the 'k' key at position (20, 12) in the forest
      const targetKey = game.gameState.availableKeys.find((key) =>
        key.position.equals(new Position(20, 12))
      );

      expect(targetKey).toBeDefined();
      expect(targetKey.key).toBe('k');

      // Navigate to the 'k' key: from (7,10) to (20,12): right 13, down 2
      for (let i = 0; i < 13; i++) {
        game.movePlayerUseCase.executeSync('right');
      }
      game.movePlayerUseCase.executeSync('down');
      game.movePlayerUseCase.executeSync('down');

      expect(game.gameState.cursor.position).toHavePosition(20, 12);
      expect(game.gameState.collectedKeys.has('k')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

    it('should collect the furthest forest key', () => {
      // Test collecting the 'l' key at position (27, 12) in the forest
      const targetKey = game.gameState.availableKeys.find((key) =>
        key.position.equals(new Position(27, 12))
      );

      expect(targetKey).toBeDefined();
      expect(targetKey.key).toBe('l');

      // Navigate to the 'l' key: from (7,10) to (27,12): right 20, down 2
      for (let i = 0; i < 20; i++) {
        game.movePlayerUseCase.executeSync('right');
      }
      game.movePlayerUseCase.executeSync('down');
      game.movePlayerUseCase.executeSync('down');

      expect(game.gameState.cursor.position).toHavePosition(27, 12);
      expect(game.gameState.collectedKeys.has('l')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });
  });

  describe('Forest Navigation', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'default' });
    });

    it('should block movement into tree barriers', () => {
      // Try to move up from starting position (1,1) into tree barrier at (1,0)
      const positionBeforeMove = game.gameState.cursor.position;
      game.movePlayerUseCase.executeSync('up');

      // Player should not have moved
      expect(game.gameState.cursor.position).toEqual(positionBeforeMove);
    });

    it('should allow movement through forest paths', () => {
      // Navigate through the forest paths from starting position
      game.movePlayerUseCase.executeSync('right'); // (8,10)
      expect(game.gameState.cursor.position).toHavePosition(8, 10);

      game.movePlayerUseCase.executeSync('right'); // (9,10)
      expect(game.gameState.cursor.position).toHavePosition(9, 10);

      game.movePlayerUseCase.executeSync('down'); // (9,11)
      expect(game.gameState.cursor.position).toHavePosition(9, 11);

      game.movePlayerUseCase.executeSync('down'); // (9,12)
      expect(game.gameState.cursor.position).toHavePosition(9, 12);
    });

    it('should prevent movement into tree barriers within forest', () => {
      // Navigate to a position in the forest
      game.movePlayerUseCase.executeSync('right'); // (8,10)
      game.movePlayerUseCase.executeSync('right'); // (9,10)
      game.movePlayerUseCase.executeSync('right'); // (10,10)

      // Try to move up into tree barrier - should be blocked
      const positionBeforeMove = game.gameState.cursor.position;
      game.movePlayerUseCase.executeSync('up');

      // Player should not have moved
      expect(game.gameState.cursor.position).toEqual(positionBeforeMove);
    });

    it('should connect starting area to forest paths seamlessly', () => {
      // Test that player can move from starting area into forest paths
      expect(game.gameState.cursor.position).toHavePosition(7, 10); // Starting position

      game.movePlayerUseCase.executeSync('right'); // (8,10) - forest path
      expect(game.gameState.cursor.position).toHavePosition(8, 10);

      game.movePlayerUseCase.executeSync('down'); // (8,11) - continue through forest
      expect(game.gameState.cursor.position).toHavePosition(8, 11);
    });
  });

  describe('Game Rendering', () => {
    beforeEach(() => {
      game = new VimForKidsGame({ level: 'default' });
    });

    it('should update rendering after movement', () => {
      const gameBoard = document.getElementById('gameBoard');

      // Get initial cursor position
      const initialPosition = game.gameState.cursor.position;

      // Move cursor right
      game.movePlayerUseCase.executeSync('right');

      // Check that cursor position has changed
      const newPosition = game.gameState.cursor.position;
      expect(newPosition.x).toBe(initialPosition.x + 1);
      expect(newPosition.y).toBe(initialPosition.y);

      // Check that cursor tile is still rendered
      const cursorTile = gameBoard.querySelector('.tile.cursor');
      expect(cursorTile).toBeTruthy();
      expect(cursorTile.textContent).toBe('●');
    });

    it('should remove key from display after collection', () => {
      const gameBoard = document.getElementById('gameBoard');

      // Check initial key tiles (only those visible in viewport)
      let keyTiles = gameBoard.querySelectorAll('.tile.key');
      const initialKeyCount = keyTiles.length;
      expect(initialKeyCount).toBeGreaterThan(0); // Should have at least one visible key

      // Collect a key
      game.movePlayerUseCase.executeSync('right');
      game.movePlayerUseCase.executeSync('down');
      game.movePlayerUseCase.executeSync('down');

      // Check that one key tile is removed
      keyTiles = gameBoard.querySelectorAll('.tile.key');
      expect(keyTiles.length).toBe(initialKeyCount - 1);
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
