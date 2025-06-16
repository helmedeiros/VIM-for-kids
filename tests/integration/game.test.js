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
      game = new VimForKidsGame();

      expect(game.gameState).toBeDefined();
      expect(game.gameRenderer).toBeDefined();
      expect(game.inputHandler).toBeDefined();
      expect(game.movePlayerUseCase).toBeDefined();
    });

    it('should render initial game state', () => {
      game = new VimForKidsGame();

      const gameBoard = document.getElementById('gameBoard');
      const tiles = gameBoard.querySelectorAll('.tile');

      expect(tiles.length).toBe(144); // 12x12 grid

      // Should have player tile
      const playerTiles = gameBoard.querySelectorAll('.tile.player');
      expect(playerTiles.length).toBe(1);

      // Should have VIM key tiles
      const keyTiles = gameBoard.querySelectorAll('.tile.key');
      expect(keyTiles.length).toBe(4); // h, j, k, l keys
    });

    it('should have player at correct starting position', () => {
      game = new VimForKidsGame();

      expect(game.gameState.player.position).toHavePosition(5, 2);
    });

    it('should have all VIM keys available initially', () => {
      game = new VimForKidsGame();

      expect(game.gameState.availableKeys).toHaveLength(4);
      expect(game.gameState.collectedKeys.size).toBe(0);

      const keyNames = game.gameState.availableKeys.map((key) => key.key);
      expect(keyNames).toContain('h');
      expect(keyNames).toContain('j');
      expect(keyNames).toContain('k');
      expect(keyNames).toContain('l');
    });
  });

  describe('Player Movement', () => {
    beforeEach(() => {
      game = new VimForKidsGame();
    });

    it('should move player right', () => {
      const originalPosition = game.gameState.player.position;
      game.movePlayerUseCase.execute('right');

      expect(game.gameState.player.position).toHavePosition(
        originalPosition.x + 1,
        originalPosition.y
      );
    });

    it('should move player left', () => {
      // First move right to ensure we can move left
      game.movePlayerUseCase.execute('right');
      const position = game.gameState.player.position;

      game.movePlayerUseCase.execute('left');

      expect(game.gameState.player.position).toHavePosition(position.x - 1, position.y);
    });

    it('should move player down', () => {
      const originalPosition = game.gameState.player.position;
      game.movePlayerUseCase.execute('down');

      expect(game.gameState.player.position).toHavePosition(
        originalPosition.x,
        originalPosition.y + 1
      );
    });

    it('should move player up', () => {
      // First move down to ensure we can move up
      game.movePlayerUseCase.execute('down');
      const position = game.gameState.player.position;

      game.movePlayerUseCase.execute('up');

      expect(game.gameState.player.position).toHavePosition(position.x, position.y - 1);
    });

    it('should not move into water tiles', () => {
      // Move up twice should hit water boundary
      game.movePlayerUseCase.execute('up');
      game.movePlayerUseCase.execute('up');

      // Should not be at (5, 0) which is water
      expect(game.gameState.player.position.y).toBeGreaterThan(0);
    });
  });

  describe('Key Collection', () => {
    beforeEach(() => {
      game = new VimForKidsGame();
    });

    it('should collect key when player moves to key position', () => {
      // Move to a key position (2, 3) where 'h' key is located
      const targetKey = game.gameState.availableKeys.find((key) =>
        key.position.equals(new Position(2, 3))
      );

      expect(targetKey).toBeDefined();
      expect(targetKey.key).toBe('h');

      // Navigate to the key position
      // From (5,2) to (2,3): left 3, down 1
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('down');

      expect(game.gameState.player.position).toHavePosition(2, 3);
      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

    it('should collect key without popup when key is collected', () => {
      // Navigate to key position and verify key is collected
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('down');

      // Verify key was collected
      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.availableKeys.length).toBe(3);
    });

    it('should update UI when key is collected', () => {
      // Collect a key
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('down');

      // Check that key display is updated
      const keyDisplay = document.querySelector('.key-display');
      const collectedKeyElements = keyDisplay.querySelectorAll('.collected-key');

      expect(collectedKeyElements.length).toBe(1);
      expect(collectedKeyElements[0].textContent).toBe('h');
    });
  });

  describe('Game Rendering', () => {
    beforeEach(() => {
      game = new VimForKidsGame();
    });

    it('should update rendering after movement', () => {
      const gameBoard = document.getElementById('gameBoard');

      // Get initial player tile position
      let playerTile = gameBoard.querySelector('.tile.player');
      const initialTileIndex = Array.from(gameBoard.children).indexOf(playerTile);

      // Move player right
      game.movePlayerUseCase.execute('right');

      // Check that player tile has moved
      playerTile = gameBoard.querySelector('.tile.player');
      const newTileIndex = Array.from(gameBoard.children).indexOf(playerTile);

      expect(newTileIndex).toBe(initialTileIndex + 1); // Moved one tile right
    });

    it('should remove key from display after collection', () => {
      const gameBoard = document.getElementById('gameBoard');

      // Check initial key tiles
      let keyTiles = gameBoard.querySelectorAll('.tile.key');
      expect(keyTiles.length).toBe(4);

      // Collect a key
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('left');
      game.movePlayerUseCase.execute('down');

      // Check that one key tile is removed
      keyTiles = gameBoard.querySelectorAll('.tile.key');
      expect(keyTiles.length).toBe(3);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      game = new VimForKidsGame();
    });

    it('should handle invalid movement direction gracefully', () => {
      const originalPosition = game.gameState.player.position;

      expect(() => {
        game.movePlayerUseCase.execute('invalid');
      }).toThrow('Invalid direction: invalid');

      // Player position should not change
      expect(game.gameState.player.position).toEqual(originalPosition);
    });

    it('should handle missing DOM elements gracefully', () => {
      // Remove game board element
      document.getElementById('gameBoard').remove();

      expect(() => {
        new VimForKidsGame();
      }).toThrow();
    });
  });
});
