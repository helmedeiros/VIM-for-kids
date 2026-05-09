import { GameLoop } from '../../../src/infrastructure/rendering/GameLoop.js';

describe('GameLoop', () => {
  let mockUpdate;
  let mockDraw;
  let gameLoop;
  let rafCallbacks;
  let rafIdCounter;

  beforeEach(() => {
    mockUpdate = jest.fn();
    mockDraw = jest.fn();
    rafCallbacks = new Map();
    rafIdCounter = 0;

    global.requestAnimationFrame = jest.fn((callback) => {
      const id = ++rafIdCounter;
      rafCallbacks.set(id, callback);
      return id;
    });

    global.cancelAnimationFrame = jest.fn((id) => {
      rafCallbacks.delete(id);
    });

    gameLoop = new GameLoop(mockUpdate, mockDraw);
  });

  afterEach(() => {
    if (gameLoop.isRunning) {
      gameLoop.stop();
    }
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
  });

  function simulateFrame(timestamp) {
    const lastId = rafIdCounter;
    const callback = rafCallbacks.get(lastId);
    if (callback) {
      rafCallbacks.delete(lastId);
      callback(timestamp);
    }
  }

  describe('constructor', () => {
    it('throws if updateFn is not a function', () => {
      expect(() => new GameLoop(null, mockDraw)).toThrow('updateFn must be a function');
    });

    it('throws if drawFn is not a function', () => {
      expect(() => new GameLoop(mockUpdate, 'not-a-fn')).toThrow('drawFn must be a function');
    });

    it('initializes as not running', () => {
      expect(gameLoop.isRunning).toBe(false);
    });
  });

  describe('start', () => {
    it('sets isRunning to true', () => {
      gameLoop.start();
      expect(gameLoop.isRunning).toBe(true);
    });

    it('requests an animation frame', () => {
      gameLoop.start();
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('does nothing if already running', () => {
      gameLoop.start();
      gameLoop.start();
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('sets isRunning to false', () => {
      gameLoop.start();
      gameLoop.stop();
      expect(gameLoop.isRunning).toBe(false);
    });

    it('cancels the pending animation frame', () => {
      gameLoop.start();
      gameLoop.stop();
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    it('does nothing if not running', () => {
      gameLoop.stop();
      expect(global.cancelAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('_tick', () => {
    it('calls update with 0 deltaTime on first frame', () => {
      gameLoop.start();
      simulateFrame(1000);
      expect(mockUpdate).toHaveBeenCalledWith(0);
    });

    it('calculates deltaTime between frames in seconds', () => {
      gameLoop.start();
      simulateFrame(1000);
      simulateFrame(1016.67); // ~60fps
      expect(mockUpdate).toHaveBeenLastCalledWith(expect.closeTo(0.01667, 4));
    });

    it('calls draw when redraw is needed', () => {
      gameLoop.start();
      simulateFrame(1000);
      expect(mockDraw).toHaveBeenCalledTimes(1);
    });

    it('skips draw when no redraw requested', () => {
      gameLoop.start();
      simulateFrame(1000); // draws (initial needsRedraw=true)
      simulateFrame(1016); // should not draw
      expect(mockDraw).toHaveBeenCalledTimes(1);
    });

    it('draws again after requestRedraw', () => {
      gameLoop.start();
      simulateFrame(1000);
      gameLoop.requestRedraw();
      simulateFrame(1016);
      expect(mockDraw).toHaveBeenCalledTimes(2);
    });

    it('caps deltaTime at 0.1 seconds', () => {
      gameLoop.start();
      simulateFrame(1000);
      simulateFrame(2000); // 1 second gap (tab switch)
      expect(mockUpdate).toHaveBeenLastCalledWith(0.1);
    });

    it('schedules next frame after tick', () => {
      gameLoop.start();
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
      simulateFrame(1000);
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it('does not tick after stop', () => {
      gameLoop.start();
      gameLoop.stop();
      simulateFrame(1000);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('requestRedraw', () => {
    it('marks loop for redraw on next frame', () => {
      gameLoop.start();
      simulateFrame(1000); // consumes initial needsRedraw
      mockDraw.mockClear();

      gameLoop.requestRedraw();
      simulateFrame(1016);
      expect(mockDraw).toHaveBeenCalledTimes(1);
    });
  });
});
