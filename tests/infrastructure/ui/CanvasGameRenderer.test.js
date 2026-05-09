import { CanvasGameRenderer } from '../../../src/infrastructure/ui/CanvasGameRenderer.js';

describe('CanvasGameRenderer', () => {
  let renderer;
  let mockCtx;

  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';

    // Create required DOM structure
    const container = document.createElement('div');
    container.id = 'game-container';

    const gameBoard = document.createElement('div');
    gameBoard.id = 'gameBoard';
    container.appendChild(gameBoard);

    const keysDisplay = document.createElement('div');
    keysDisplay.className = 'key-display';
    container.appendChild(keysDisplay);

    const collectibleDisplay = document.createElement('div');
    collectibleDisplay.className = 'collectible-display';
    container.appendChild(collectibleDisplay);

    document.body.appendChild(container);

    // Mock canvas context
    mockCtx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      drawImage: jest.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
    };

    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCtx);

    // Mock rAF
    global.requestAnimationFrame = jest.fn((cb) => {
      return 1;
    });
    global.cancelAnimationFrame = jest.fn();

    renderer = new CanvasGameRenderer();
  });

  afterEach(() => {
    if (renderer && renderer.cleanup) {
      renderer.cleanup();
    }
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
    jest.restoreAllMocks();
  });

  function createMockGameState(overrides = {}) {
    const Position = class {
      constructor(x, y) {
        this._x = x;
        this._y = y;
      }
      get x() {
        return this._x;
      }
      get y() {
        return this._y;
      }
      equals(other) {
        return other && this._x === other.x && this._y === other.y;
      }
    };

    const cursorPos = overrides.cursorPosition || { x: 5, y: 5 };

    return {
      map: {
        width: overrides.mapWidth || 20,
        height: overrides.mapHeight || 20,
        size: overrides.mapWidth || 20,
        getTileAt: jest.fn().mockReturnValue({ name: 'grass', walkable: true }),
      },
      cursor: {
        position: new Position(cursorPos.x, cursorPos.y),
      },
      availableKeys: overrides.availableKeys || [],
      availableCollectibleKeys: overrides.availableCollectibleKeys || [],
      collectedKeys: overrides.collectedKeys || new Set(),
      collectedCollectibleKeys: overrides.collectedCollectibleKeys || new Set(),
      textLabels: overrides.textLabels || [],
      gate: overrides.gate || null,
      secondaryGates: overrides.secondaryGates || [],
      npcs: overrides.npcs || [],
    };
  }

  describe('constructor', () => {
    it('creates a canvas element', () => {
      expect(renderer.gameBoard).toBeDefined();
      expect(renderer.gameBoard.tagName).toBe('CANVAS');
    });

    it('sets canvas as focusable', () => {
      expect(renderer.gameBoard.getAttribute('tabindex')).toBe('0');
    });

    it('hides the existing DOM gameBoard', () => {
      const originalBoard = document.getElementById('gameBoard');
      expect(originalBoard.style.display).toBe('none');
    });

    it('starts the game loop', () => {
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('stores current game state', () => {
      const state = createMockGameState();
      renderer.render(state);
      expect(renderer._currentGameState).toBe(state);
    });

    it('rebuilds entity index', () => {
      const spy = jest.spyOn(renderer._entityIndex, 'rebuild');
      const state = createMockGameState();
      renderer.render(state);
      expect(spy).toHaveBeenCalledWith(state);
    });

    it('updates camera with cursor position', () => {
      const spy = jest.spyOn(renderer._camera, 'update');
      const state = createMockGameState({ cursorPosition: { x: 10, y: 8 } });
      renderer.render(state);
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0].x).toBe(10);
      expect(spy.mock.calls[0][0].y).toBe(8);
    });

    it('requests redraw from game loop', () => {
      const spy = jest.spyOn(renderer._gameLoop, 'requestRedraw');
      renderer.render(createMockGameState());
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('_draw', () => {
    it('clears the canvas', () => {
      renderer.render(createMockGameState());
      renderer._draw(0);
      expect(mockCtx.clearRect).toHaveBeenCalledWith(
        0,
        0,
        renderer.gameBoard.width,
        renderer.gameBoard.height
      );
    });

    it('draws tile rectangles', () => {
      renderer.render(createMockGameState());
      renderer._draw(0);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('draws cursor', () => {
      renderer.render(createMockGameState({ cursorPosition: { x: 5, y: 5 } }));
      renderer._draw(0);
      // Cursor fillText for the bullet character
      const fillTextCalls = mockCtx.fillText.mock.calls;
      const cursorCall = fillTextCalls.find((c) => c[0] === '\u25CF');
      expect(cursorCall).toBeDefined();
    });

    it('does not draw when no game state', () => {
      renderer._draw(0);
      expect(mockCtx.clearRect).not.toHaveBeenCalled();
    });
  });

  describe('_drawEntitiesAt', () => {
    it('draws VIM keys', () => {
      const state = createMockGameState({
        availableKeys: [
          {
            position: { x: 3, y: 3 },
            key: 'h',
          },
        ],
      });
      renderer.render(state);
      renderer._drawEntitiesAt(mockCtx, 3, 3, 0, 0, 32);
      const calls = mockCtx.fillText.mock.calls;
      expect(calls.some((c) => c[0] === 'h')).toBe(true);
    });

    it('draws NPCs with visual symbol', () => {
      const state = createMockGameState({
        npcs: [{ id: 'caret_spirit', position: [4, 4], getVisualSymbol: () => '\uD83D\uDD25' }],
      });
      renderer.render(state);
      renderer._drawEntitiesAt(mockCtx, 4, 4, 0, 0, 32);
      const calls = mockCtx.fillText.mock.calls;
      expect(calls.some((c) => c[0] === '\uD83D\uDD25')).toBe(true);
    });

    it('draws NPC fallback symbol when no getVisualSymbol', () => {
      const state = createMockGameState({
        npcs: [{ id: 'bug_king', position: [4, 4] }],
      });
      renderer.render(state);
      renderer._drawEntitiesAt(mockCtx, 4, 4, 0, 0, 32);
      const calls = mockCtx.fillText.mock.calls;
      expect(calls.some((c) => c[0] === '\u265B')).toBe(true);
    });

    it('draws text labels', () => {
      const state = createMockGameState({
        textLabels: [{ position: { x: 2, y: 2 }, text: 'H', color: '#fff', fontSize: '12px' }],
      });
      renderer.render(state);
      renderer._drawEntitiesAt(mockCtx, 2, 2, 0, 0, 32);
      const calls = mockCtx.fillText.mock.calls;
      expect(calls.some((c) => c[0] === 'H')).toBe(true);
    });

    it('draws gates', () => {
      const state = createMockGameState({
        gate: { position: { x: 5, y: 5 }, isOpen: false },
      });
      renderer.render(state);
      renderer._drawEntitiesAt(mockCtx, 5, 5, 0, 0, 32);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('updateCollectedKeysDisplay', () => {
    it('shows empty message when no keys collected', () => {
      renderer.updateCollectedKeysDisplay(new Set());
      const display = document.querySelector('.key-display');
      expect(display.textContent).toContain('No keys collected yet!');
    });

    it('shows collected key names', () => {
      renderer.updateCollectedKeysDisplay(new Set(['h', 'j']));
      const display = document.querySelector('.key-display');
      const keys = display.querySelectorAll('.collected-key');
      expect(keys).toHaveLength(2);
      expect(keys[0].textContent).toBe('h');
      expect(keys[1].textContent).toBe('j');
    });
  });

  describe('updateCollectibleInventoryDisplay', () => {
    it('shows empty message when no collectibles', () => {
      renderer.updateCollectibleInventoryDisplay(new Set());
      const display = document.querySelector('.collectible-display');
      expect(display.textContent).toContain('No special keys found yet!');
    });

    it('shows collected collectible keys', () => {
      renderer.updateCollectibleInventoryDisplay(new Set(['maze_key']));
      const display = document.querySelector('.collectible-display');
      const keys = display.querySelectorAll('.collected-collectible-key');
      expect(keys).toHaveLength(1);
      expect(keys[0].textContent).toContain('Maze Key');
    });
  });

  describe('showKeyInfo', () => {
    it('shows feedback for collectible keys', () => {
      renderer.showKeyInfo({ type: 'collectible_key', keyId: 'maze_key' });
      const feedback = document.querySelector('.key-collection-feedback');
      expect(feedback).not.toBeNull();
      expect(feedback.textContent).toContain('Maze Key');
    });

    it('does nothing for VIM keys', () => {
      renderer.showKeyInfo({ type: 'vim_key', key: 'h' });
      const feedback = document.querySelector('.key-collection-feedback');
      expect(feedback).toBeNull();
    });
  });

  describe('showMessage', () => {
    it('creates a message bubble', () => {
      renderer.showMessage('Hello world');
      const bubble = document.querySelector('.message-bubble');
      expect(bubble).not.toBeNull();
      expect(bubble.textContent).toContain('Hello world');
    });

    it('includes speaker name when provided', () => {
      renderer.showMessage('Greetings', { speaker: 'NPC' });
      const speaker = document.querySelector('.message-speaker');
      expect(speaker.textContent).toBe('NPC');
    });

    it('includes close button', () => {
      renderer.showMessage('Test');
      const closeBtn = document.querySelector('.message-close');
      expect(closeBtn).not.toBeNull();
    });

    it('auto-hides after duration', () => {
      jest.useFakeTimers();
      renderer.showMessage('Test', { duration: 2000 });
      expect(document.querySelector('.message-bubble')).not.toBeNull();
      jest.advanceTimersByTime(2000);
      expect(document.querySelector('.message-bubble')).toBeNull();
      jest.useRealTimers();
    });

    it('removes previous message', () => {
      renderer.showMessage('First');
      renderer.showMessage('Second');
      const bubbles = document.querySelectorAll('.message-bubble');
      expect(bubbles).toHaveLength(1);
      expect(bubbles[0].textContent).toContain('Second');
    });
  });

  describe('hideMessage', () => {
    it('removes current message', () => {
      renderer.showMessage('Test');
      renderer.hideMessage();
      expect(document.querySelector('.message-bubble')).toBeNull();
    });

    it('does nothing when no message displayed', () => {
      expect(() => renderer.hideMessage()).not.toThrow();
    });
  });

  describe('showNPCDialogue', () => {
    it('joins array dialogue into single string', () => {
      const spy = jest.spyOn(renderer, 'showNPCBalloon');
      renderer.showNPCDialogue({ id: 'test' }, ['Hello', 'World']);
      expect(spy).toHaveBeenCalledWith({ id: 'test' }, 'Hello World', {});
    });

    it('converts non-array dialogue to string', () => {
      const spy = jest.spyOn(renderer, 'showNPCBalloon');
      renderer.showNPCDialogue({ id: 'test' }, 'Single line');
      expect(spy).toHaveBeenCalledWith({ id: 'test' }, 'Single line', {});
    });
  });

  describe('showNPCBalloon', () => {
    it('creates a balloon element', () => {
      renderer.showNPCBalloon({ id: 'test' }, 'Hello');
      const balloon = document.querySelector('.npc-balloon');
      expect(balloon).not.toBeNull();
      expect(balloon.textContent).toBe('Hello');
    });

    it('fades out existing balloons first', () => {
      renderer.showNPCBalloon({ id: 'test' }, 'First');
      renderer.showNPCBalloon({ id: 'test' }, 'Second');
      const balloons = document.querySelectorAll('.npc-balloon:not(.fade-out)');
      expect(balloons).toHaveLength(1);
      expect(balloons[0].textContent).toBe('Second');
    });

    it('auto-removes after duration', () => {
      jest.useFakeTimers();
      renderer.showNPCBalloon({ id: 'test' }, 'Hello', { duration: 3000 });
      expect(document.querySelector('.npc-balloon')).not.toBeNull();
      jest.advanceTimersByTime(3000);
      expect(document.querySelector('.npc-balloon')).toBeNull();
      jest.useRealTimers();
    });
  });

  describe('fadeOutExistingBalloons', () => {
    it('adds fade-out class to existing balloons', () => {
      renderer.showNPCBalloon({ id: 'test' }, 'Hello', { duration: 0 });
      renderer.fadeOutExistingBalloons();
      const balloons = document.querySelectorAll('.npc-balloon.fade-out');
      expect(balloons).toHaveLength(1);
    });

    it('does not double-fade balloons', () => {
      renderer.showNPCBalloon({ id: 'test' }, 'Hello', { duration: 0 });
      renderer.fadeOutExistingBalloons();
      renderer.fadeOutExistingBalloons();
      // Should still only have 1 balloon (no duplicates)
      const balloons = document.querySelectorAll('.npc-balloon');
      expect(balloons).toHaveLength(1);
    });
  });

  describe('focus', () => {
    it('focuses the canvas element', () => {
      const spy = jest.spyOn(renderer.gameBoard, 'focus');
      renderer.focus();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('resetCamera', () => {
    it('resets the camera state', () => {
      const spy = jest.spyOn(renderer._camera, 'reset');
      renderer.resetCamera();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('_formatKeyName', () => {
    it('formats snake_case to Title Case', () => {
      expect(renderer._formatKeyName('maze_key')).toBe('Maze Key');
    });

    it('capitalizes single word', () => {
      expect(renderer._formatKeyName('golden')).toBe('Golden');
    });
  });

  describe('_getNpcFallbackSymbol', () => {
    it('returns symbol for known NPC id', () => {
      expect(renderer._getNpcFallbackSymbol({ id: 'bug_king' })).toBe('\u265B');
    });

    it('returns symbol for known NPC type', () => {
      expect(renderer._getNpcFallbackSymbol({ type: 'caret_spirit' })).toBe('\uD83D\uDD25');
    });

    it('returns default wizard for unknown NPC', () => {
      expect(renderer._getNpcFallbackSymbol({ id: 'unknown' })).toBe(
        '\uD83E\uDDD9\u200D\u2642\uFE0F'
      );
    });
  });

  describe('cleanup', () => {
    it('stops the game loop', () => {
      const spy = jest.spyOn(renderer._gameLoop, 'stop');
      renderer.cleanup();
      expect(spy).toHaveBeenCalled();
    });

    it('removes canvas from DOM', () => {
      renderer.cleanup();
      expect(document.getElementById('gameBoardCanvas')).toBeNull();
    });
  });
});
