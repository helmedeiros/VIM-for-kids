import { InputHandler } from '../../../src/ports/input/InputHandler.js';

describe('InputHandler', () => {
  let inputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
  });

  describe('Constructor', () => {
    it('should create an instance of InputHandler', () => {
      expect(inputHandler).toBeInstanceOf(InputHandler);
    });
  });

  describe('Abstract methods', () => {
    it('should throw error when handleInput is called on base class', () => {
      expect(() => inputHandler.handleInput('key')).toThrow(
        'inputHandler.handleInput is not a function'
      );
    });

    it('should throw error when setInputCallback is called on base class', () => {
      expect(() => inputHandler.setInputCallback(() => {})).toThrow(
        'inputHandler.setInputCallback is not a function'
      );
    });
  });
});
