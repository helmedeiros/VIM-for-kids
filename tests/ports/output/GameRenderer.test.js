import { GameRenderer } from '../../../src/ports/output/GameRenderer.js';

describe('GameRenderer', () => {
  let gameRenderer;

  beforeEach(() => {
    gameRenderer = new GameRenderer();
  });

  describe('Constructor', () => {
    it('should create an instance of GameRenderer', () => {
      expect(gameRenderer).toBeInstanceOf(GameRenderer);
    });
  });

  describe('Abstract methods', () => {
    it('should throw error when render is called on base class', () => {
      const mockGameState = {};
      expect(() => gameRenderer.render(mockGameState)).toThrow(
        'GameRenderer.render() must be implemented'
      );
    });

    it('should throw error when initialize is called on base class', () => {
      expect(() => gameRenderer.initialize()).toThrow('gameRenderer.initialize is not a function');
    });

    it('should throw error when dispose is called on base class', () => {
      expect(() => gameRenderer.dispose()).toThrow('gameRenderer.dispose is not a function');
    });

    it('should throw error when setEventCallback is called on base class', () => {
      expect(() => gameRenderer.setEventCallback(() => {})).toThrow(
        'gameRenderer.setEventCallback is not a function'
      );
    });
  });
});
