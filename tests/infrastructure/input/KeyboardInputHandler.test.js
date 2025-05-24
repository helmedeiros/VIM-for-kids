import { KeyboardInputHandler } from '../../../src/infrastructure/input/KeyboardInputHandler.js';

describe('KeyboardInputHandler', () => {
  let inputHandler;
  let mockCallback;
  let mockGameBoard;

  beforeEach(() => {
    mockCallback = jest.fn();
    mockGameBoard = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      focus: jest.fn()
    };
    inputHandler = new KeyboardInputHandler(mockGameBoard);
  });

  afterEach(() => {
    // Clean up event listeners
    if (inputHandler && inputHandler.cleanup) {
      inputHandler.cleanup();
    }
  });

  describe('constructor', () => {
    it('should create instance with game board reference', () => {
      expect(inputHandler).toBeInstanceOf(KeyboardInputHandler);
      expect(inputHandler.gameBoard).toBe(mockGameBoard);
      expect(inputHandler.handleMovement).toBeNull();
    });
  });

  describe('setupInputHandling', () => {
    it('should register event listeners', () => {
      inputHandler.setupInputHandling(mockCallback);

      expect(mockGameBoard.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockGameBoard.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

    describe('key mapping', () => {
    it('should map VIM keys correctly', () => {
      expect(inputHandler._mapKeyToDirection('h')).toBe('left');
      expect(inputHandler._mapKeyToDirection('j')).toBe('down');
      expect(inputHandler._mapKeyToDirection('k')).toBe('up');
      expect(inputHandler._mapKeyToDirection('l')).toBe('right');
    });

    it('should map arrow keys correctly', () => {
      expect(inputHandler._mapKeyToDirection('arrowup')).toBe('up');
      expect(inputHandler._mapKeyToDirection('arrowdown')).toBe('down');
      expect(inputHandler._mapKeyToDirection('arrowleft')).toBe('left');
      expect(inputHandler._mapKeyToDirection('arrowright')).toBe('right');
    });

    it('should return null for unmapped keys', () => {
      expect(inputHandler._mapKeyToDirection('a')).toBeNull();
      expect(inputHandler._mapKeyToDirection('space')).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on cleanup', () => {
      inputHandler.setupInputHandling(mockCallback);
      inputHandler.cleanup();

      expect(mockGameBoard.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(inputHandler.handleMovement).toBeNull();
    });

    it('should handle cleanup when no handler is set', () => {
      expect(() => inputHandler.cleanup()).not.toThrow();
    });
  });
});
