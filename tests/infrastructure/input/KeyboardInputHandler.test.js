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
      focus: jest.fn(),
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

    it('should handle valid key presses and call movement callback', () => {
      inputHandler.setupInputHandling(mockCallback);

      // Get the registered keydown handler
      const keydownHandler = mockGameBoard.addEventListener.mock.calls.find(
        (call) => call[0] === 'keydown'
      )[1];

      const mockEvent = {
        key: 'h',
        preventDefault: jest.fn(),
      };

      keydownHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith('left');
    });

    it('should handle arrow keys and call movement callback', () => {
      inputHandler.setupInputHandling(mockCallback);

      const keydownHandler = mockGameBoard.addEventListener.mock.calls.find(
        (call) => call[0] === 'keydown'
      )[1];

      const mockEvent = {
        key: 'ArrowUp',
        preventDefault: jest.fn(),
      };

      keydownHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith('up');
    });

    it('should not call movement callback for invalid keys', () => {
      inputHandler.setupInputHandling(mockCallback);

      const keydownHandler = mockGameBoard.addEventListener.mock.calls.find(
        (call) => call[0] === 'keydown'
      )[1];

      const mockEvent = {
        key: 'a',
        preventDefault: jest.fn(),
      };

      keydownHandler(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle click events to focus game board', () => {
      inputHandler.setupInputHandling(mockCallback);

      // Get the registered click handler
      const clickHandler = mockGameBoard.addEventListener.mock.calls.find(
        (call) => call[0] === 'click'
      )[1];

      clickHandler();

      expect(mockGameBoard.focus).toHaveBeenCalled();
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

      expect(mockGameBoard.removeEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
      expect(inputHandler.handleMovement).toBeNull();
    });

    it('should handle cleanup when no handler is set', () => {
      expect(() => inputHandler.cleanup()).not.toThrow();
    });
  });
});
