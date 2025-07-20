import { DOMGameRenderer } from '../../../src/infrastructure/ui/DOMGameRenderer.js';

describe('DOMGameRenderer', () => {
  let renderer;
  let gameContainer;

  beforeEach(() => {
    // Set up DOM elements that DOMGameRenderer expects
    document.body.innerHTML = '';

    gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.appendChild(gameContainer);

    // Create game board element that DOMGameRenderer constructor expects
    const gameBoard = document.createElement('div');
    gameBoard.id = 'gameBoard'; // Note: constructor expects 'gameBoard', not 'game-board'
    gameBoard.className = 'game-board';
    gameBoard.style.display = 'grid';
    gameContainer.appendChild(gameBoard);

    // Create collected keys display that DOMGameRenderer constructor expects
    const keysDisplay = document.createElement('div');
    keysDisplay.className = 'key-display'; // Note: constructor expects '.key-display' class
    gameContainer.appendChild(keysDisplay);

    renderer = new DOMGameRenderer();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    if (renderer && renderer.messageTimeout) {
      clearTimeout(renderer.messageTimeout);
    }
  });

  describe('showNPCDialogue', () => {
    const mockNPC = {
      id: 'test-npc',
      name: 'Test NPC',
    };

    it('should use balloon for short dialogue', () => {
      const shortDialogue = 'Hello!';
      const spy = jest.spyOn(renderer, 'showNPCBalloon');

      renderer.showNPCDialogue(mockNPC, shortDialogue);

      expect(spy).toHaveBeenCalledWith(mockNPC, shortDialogue, {});
    });

    it('should use balloon with pagination for long dialogue', () => {
      const longDialogue = 'This is a very long dialogue that exceeds the character limit for balloons and should use the pagination system instead.';
      const spy = jest.spyOn(renderer, 'showNPCBalloon');

      renderer.showNPCDialogue(mockNPC, longDialogue);

      expect(spy).toHaveBeenCalledWith(mockNPC, longDialogue, {});
    });

    it('should handle array dialogue', () => {
      const dialogueArray = ['Hello', 'How are you?'];
      const spy = jest.spyOn(renderer, 'showNPCBalloon');

      renderer.showNPCDialogue(mockNPC, dialogueArray);

      expect(spy).toHaveBeenCalledWith(mockNPC, 'Hello How are you?', {});
    });

    it('should always use balloon even with NPC ID fallback', () => {
      const npcWithoutName = { id: 'test-id' };
      const longDialogue = 'This is a very long dialogue that exceeds the character limit for balloons and should use the pagination system instead.';
      const spy = jest.spyOn(renderer, 'showNPCBalloon');

      renderer.showNPCDialogue(npcWithoutName, longDialogue);

      expect(spy).toHaveBeenCalledWith(npcWithoutName, longDialogue, {});
    });
  });

  describe('showNPCBalloon', () => {
    const mockNPC = {
      id: 'test-npc',
      name: 'Test NPC',
    };

    beforeEach(() => {
      // Set up game board with NPC tile
      const gameBoard = document.createElement('div');
      gameBoard.className = 'game-board';
      gameBoard.style.display = 'grid';
      gameContainer.appendChild(gameBoard);
      renderer.gameBoard = gameBoard;

      const npcTile = document.createElement('div');
      npcTile.className = 'tile npc';
      npcTile.title = 'Test NPC';
      gameBoard.appendChild(npcTile);
    });

    it('should create balloon above NPC', () => {
      const message = 'Hello!';

      const balloon = renderer.showNPCBalloon(mockNPC, message);

      expect(balloon).toBeTruthy();
      expect(balloon.classList.contains('npc-balloon')).toBe(true);
      expect(balloon.classList.contains('important')).toBe(true); // Message contains !
      expect(balloon.textContent).toBe(message);

      // Balloon should be in game container, not NPC tile
      const gameContainer = document.getElementById('game-container');
      expect(gameContainer.contains(balloon)).toBe(true);
    });

    it('should fade out existing balloon and create new one', () => {
      const message1 = 'First message';
      const message2 = 'Second message';

      renderer.showNPCBalloon(mockNPC, message1);
      renderer.showNPCBalloon(mockNPC, message2);

      // After calling showNPCBalloon again, we should have:
      // 1. The old balloon with fade-out class
      // 2. The new balloon without fade-out class
      const gameContainer = document.getElementById('game-container');
      const balloons = gameContainer.querySelectorAll('.npc-balloon');
      expect(balloons).toHaveLength(2);

      // First balloon should be fading out
      expect(balloons[0].classList.contains('fade-out')).toBe(true);
      expect(balloons[0].textContent).toBe(message1);

      // Second balloon should be the new one
      expect(balloons[1].classList.contains('fade-out')).toBe(false);
      expect(balloons[1].textContent).toBe(message2);
    });

    it('should auto-hide balloon after duration', (done) => {
      const message = 'Hello!';
      const duration = 100;

      const balloon = renderer.showNPCBalloon(mockNPC, message, { duration });

      expect(balloon.parentNode).toBeTruthy();

      setTimeout(() => {
        expect(balloon.parentNode).toBeFalsy();
        done();
      }, duration + 50);
    });

    it('should not auto-hide when duration is 0', () => {
      const message = 'Hello!';

      const balloon = renderer.showNPCBalloon(mockNPC, message, { duration: 0 });

      expect(balloon.parentNode).toBeTruthy();
      // No timeout should be set, balloon should persist
    });

    it('should fallback to regular message when NPC tile not found', () => {
      const mockNPCNotFound = { id: 'unknown-npc', name: 'Unknown NPC' };
      const spy = jest.spyOn(renderer, 'showMessage');

      renderer.showNPCBalloon(mockNPCNotFound, 'Hello!');

      expect(spy).toHaveBeenCalledWith('Hello!', { type: 'dialogue', duration: 4000 });
    });

    it('should display long messages in full (no pagination)', () => {
      const longMessage = 'This is a very long message that should definitely be split into two separate parts to make it much easier to read for the player in the game and provide a better user experience.';

      const balloon = renderer.showNPCBalloon(mockNPC, longMessage);

      // Balloon should show the full message (no pagination)
      expect(balloon).toBeTruthy();
      expect(balloon.textContent).toBe(longMessage);

      // Verify balloon is in the game container
      const gameContainer = document.getElementById('game-container');
      expect(gameContainer.contains(balloon)).toBe(true);
    });

    it('should display messages with proper styling', () => {
      const message = 'Test message with proper styling';

      const balloon = renderer.showNPCBalloon(mockNPC, message);

      // Verify balloon has CSS class (styling handled by CSS)
      expect(balloon.classList.contains('npc-balloon')).toBe(true);
      expect(balloon.textContent).toBe(message);

      // Verify positioning
      expect(balloon.style.transform).toBe('translateX(-50%)');
      expect(balloon.style.left).toBeDefined();
      expect(balloon.style.top).toBeDefined();
    });

    it('should handle short messages correctly', () => {
      const shortMessage = 'Hello!';

      const balloon = renderer.showNPCBalloon(mockNPC, shortMessage);

      expect(balloon.textContent).toBe(shortMessage);

      // Balloon should be in game container
      const gameContainer = document.getElementById('game-container');
      expect(gameContainer.contains(balloon)).toBe(true);
    });

    it('should apply theming based on NPC type', () => {
      const mysticalNPC = { id: 'test-npc', name: 'Test NPC', type: 'syntax-wisp' };
      const message = 'A mystical message';

      const balloon = renderer.showNPCBalloon(mysticalNPC, message);

      expect(balloon.classList.contains('npc-balloon')).toBe(true);
      expect(balloon.classList.contains('mystical')).toBe(true);
    });

    it('should detect important messages', () => {
      const message = 'Congratulations on your victory!';

      const balloon = renderer.showNPCBalloon(mockNPC, message);

      expect(balloon.classList.contains('npc-balloon')).toBe(true);
      expect(balloon.classList.contains('important')).toBe(true);
    });
  });

  describe('fadeOutExistingBalloons', () => {
    const mockNPC = {
      id: 'test-npc',
      name: 'Test NPC',
    };

    beforeEach(() => {
      // Set up game board with NPC tile
      const gameBoard = document.createElement('div');
      gameBoard.className = 'game-board';
      gameBoard.style.display = 'grid';
      gameContainer.appendChild(gameBoard);
      renderer.gameBoard = gameBoard;

      const npcTile = document.createElement('div');
      npcTile.className = 'tile npc';
      npcTile.title = 'Test NPC';
      gameBoard.appendChild(npcTile);
    });

    it('should add fade-out class to existing balloons', () => {
      // Create a balloon first
      const balloon = renderer.showNPCBalloon(mockNPC, 'Test message');
      expect(balloon.classList.contains('fade-out')).toBe(false);

      // Trigger fade-out
      renderer.fadeOutExistingBalloons();

      expect(balloon.classList.contains('fade-out')).toBe(true);
    });

    it('should remove balloons after fade-out animation', (done) => {
      // Create a balloon first
      const balloon = renderer.showNPCBalloon(mockNPC, 'Test message');
      expect(balloon.parentNode).toBeTruthy();

      // Trigger fade-out
      renderer.fadeOutExistingBalloons();

      // Check that balloon is removed after animation duration (300ms)
      setTimeout(() => {
        expect(balloon.parentNode).toBeFalsy();
        done();
      }, 350); // Wait a bit longer than the 300ms animation
    });

    it('should handle multiple balloons', () => {
      // Create multiple balloons by adding them to different containers
      const balloon1 = document.createElement('div');
      balloon1.className = 'npc-balloon';
      balloon1.textContent = 'Message 1';
      gameContainer.appendChild(balloon1);

      const balloon2 = document.createElement('div');
      balloon2.className = 'npc-balloon';
      balloon2.textContent = 'Message 2';
      gameContainer.appendChild(balloon2);

      // Trigger fade-out
      renderer.fadeOutExistingBalloons();

      expect(balloon1.classList.contains('fade-out')).toBe(true);
      expect(balloon2.classList.contains('fade-out')).toBe(true);
    });

    it('should skip balloons already fading out', () => {
      // Create a balloon and manually add fade-out class
      const balloon = document.createElement('div');
      balloon.className = 'npc-balloon fade-out';
      balloon.textContent = 'Already fading';
      gameContainer.appendChild(balloon);

      // Should not throw error or modify already fading balloons
      expect(() => {
        renderer.fadeOutExistingBalloons();
      }).not.toThrow();

      // Balloon should still have fade-out class (no additional modifications)
      expect(balloon.classList.contains('fade-out')).toBe(true);
    });

    it('should handle case when no balloons exist', () => {
      // Should not throw error when no balloons exist
      expect(() => {
        renderer.fadeOutExistingBalloons();
      }).not.toThrow();
    });
  });

  describe('_findNPCTile', () => {
    beforeEach(() => {
      const gameBoard = document.createElement('div');
      gameBoard.className = 'game-board';
      gameContainer.appendChild(gameBoard);
      renderer.gameBoard = gameBoard;
    });

    it('should find NPC tile by name', () => {
      const npcTile = document.createElement('div');
      npcTile.className = 'tile npc';
      npcTile.title = 'Test NPC';
      renderer.gameBoard.appendChild(npcTile);

      const mockNPC = { name: 'Test NPC' };
      const foundTile = renderer._findNPCTile(mockNPC);

      expect(foundTile).toBe(npcTile);
    });

    it('should find NPC tile by ID when name unavailable', () => {
      const npcTile = document.createElement('div');
      npcTile.className = 'tile npc';
      npcTile.title = 'test-id';
      renderer.gameBoard.appendChild(npcTile);

      const mockNPC = { id: 'test-id' };
      const foundTile = renderer._findNPCTile(mockNPC);

      expect(foundTile).toBe(npcTile);
    });

    it('should use Unknown NPC fallback', () => {
      const npcTile = document.createElement('div');
      npcTile.className = 'tile npc';
      npcTile.title = 'Unknown NPC';
      renderer.gameBoard.appendChild(npcTile);

      const mockNPC = {};
      const foundTile = renderer._findNPCTile(mockNPC);

      expect(foundTile).toBe(npcTile);
    });

    it('should return null when NPC tile not found', () => {
      const mockNPC = { name: 'Nonexistent NPC' };
      const foundTile = renderer._findNPCTile(mockNPC);

      expect(foundTile).toBeNull();
    });
  });

  describe('showNPCMessage', () => {
    it('should create message without close button', () => {
      const message = 'Test message';
      const options = { speaker: 'Test Speaker', type: 'dialogue' };

      const messageElement = renderer.showNPCMessage(message, options);

      expect(messageElement).toBeTruthy();
      expect(messageElement.className).toBe('message-bubble dialogue');
      expect(messageElement.querySelector('.message-close')).toBeNull();
      expect(messageElement.querySelector('.message-speaker').textContent).toBe('Test Speaker');
      expect(messageElement.querySelector('.message-text').textContent).toBe(message);
    });

    it('should work without speaker', () => {
      const message = 'Test message';

      const messageElement = renderer.showNPCMessage(message);

      expect(messageElement.querySelector('.message-speaker')).toBeNull();
      expect(messageElement.querySelector('.message-text').textContent).toBe(message);
    });

    it('should auto-hide after duration', () => {
      jest.useFakeTimers();

      const message = 'Test message';
      const duration = 100;

      const messageElement = renderer.showNPCMessage(message, { duration });

      expect(messageElement.parentNode).toBeTruthy();

      // Fast-forward time
      jest.advanceTimersByTime(duration);

      expect(messageElement.parentNode).toBeFalsy();

      jest.useRealTimers();
    });

    it('should set position attribute', () => {
      const message = 'Test message';

      const messageElement = renderer.showNPCMessage(message, { position: 'top' });

      expect(messageElement.getAttribute('data-position')).toBe('top');
    });

    it('should remove existing message before creating new one', () => {
      renderer.showNPCMessage('First message');
      renderer.showNPCMessage('Second message');

      const messages = gameContainer.querySelectorAll('.message-bubble');
      expect(messages).toHaveLength(1);
      expect(messages[0].querySelector('.message-text').textContent).toBe('Second message');
    });
  });

  describe('integration with existing methods', () => {
    it('should not interfere with regular showMessage', () => {
      const regularMessage = renderer.showMessage('Regular message');

      expect(regularMessage.querySelector('.message-close')).toBeTruthy();
    });

    it('should properly clean up on hideMessage', () => {
      renderer.showNPCMessage('Test message');
      renderer.hideMessage();

      const messages = gameContainer.querySelectorAll('.message-bubble');
      expect(messages).toHaveLength(0);
    });
  });
});

describe('updateCollectibleInventoryDisplay', () => {
  let gameRenderer;
  let mockCollectibleDisplay;

  beforeEach(() => {
    // Mock DOM elements
    document.getElementById = jest.fn().mockReturnValue(document.createElement('div'));
    document.querySelector = jest.fn();

    mockCollectibleDisplay = document.createElement('div');
    document.querySelector.mockImplementation((selector) => {
      if (selector === '.key-display') return document.createElement('div');
      if (selector === '.collectible-display') return mockCollectibleDisplay;
      return null;
    });

    gameRenderer = new DOMGameRenderer();
  });

  it('should display empty message when no collectible keys are collected', () => {
    const emptySet = new Set();

    gameRenderer.updateCollectibleInventoryDisplay(emptySet);

    const emptyMessage = mockCollectibleDisplay.querySelector('.collectible-empty-message');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.textContent).toBe('No special keys found yet!');
  });

  it('should display collected collectible keys with proper formatting', () => {
    const collectedKeys = new Set(['maze_key', 'master_key']);

    gameRenderer.updateCollectibleInventoryDisplay(collectedKeys);

    const keyElements = mockCollectibleDisplay.querySelectorAll('.collected-collectible-key');
    expect(keyElements).toHaveLength(2);

    const keyNames = Array.from(keyElements).map(el =>
      el.querySelector('.collectible-key-name').textContent
    );
    expect(keyNames).toContain('Maze Key');
    expect(keyNames).toContain('Master Key');
  });

  it('should format key names correctly', () => {
    expect(gameRenderer._formatKeyName('maze_key')).toBe('Maze Key');
    expect(gameRenderer._formatKeyName('secret_door_key')).toBe('Secret Door Key');
    expect(gameRenderer._formatKeyName('master_key')).toBe('Master Key');
    expect(gameRenderer._formatKeyName('simple')).toBe('Simple');
  });

  it('should add proper CSS classes and attributes to key elements', () => {
    const collectedKeys = new Set(['test_key']);

    gameRenderer.updateCollectibleInventoryDisplay(collectedKeys);

    const keyElement = mockCollectibleDisplay.querySelector('.collected-collectible-key');
    expect(keyElement).toBeTruthy();
    expect(keyElement.className).toBe('collected-collectible-key');
    expect(keyElement.title).toBe('Collected: Test Key');
  });
});

describe('showKeyInfo with CollectibleKey support', () => {
  let gameRenderer;
  let originalAppendChild, originalRemoveChild, originalContains;

  beforeEach(() => {
    document.getElementById = jest.fn().mockReturnValue(document.createElement('div'));
    document.querySelector = jest.fn().mockReturnValue(document.createElement('div'));

    // Mock document.body methods
    originalAppendChild = document.body.appendChild;
    originalRemoveChild = document.body.removeChild;
    originalContains = document.body.contains;

    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.body.contains = jest.fn().mockReturnValue(true);

    gameRenderer = new DOMGameRenderer();
  });

  afterEach(() => {
    // Restore original methods
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    document.body.contains = originalContains;
  });

  it('should show visual feedback for CollectibleKey collection', () => {
    const collectibleKey = {
      type: 'collectible_key',
      keyId: 'maze_key',
      name: 'Maze Key'
    };

    gameRenderer.showKeyInfo(collectibleKey);

    expect(document.body.appendChild).toHaveBeenCalled();

    const feedbackCall = document.body.appendChild.mock.calls[0][0];
    expect(feedbackCall.className).toBe('key-collection-feedback');
    expect(feedbackCall.textContent).toBe('Found Maze Key!');
  });

  it('should not show popup feedback for VIM keys', () => {
    const vimKey = {
      type: 'vim_key',
      key: 'h',
      description: 'Move left'
    };

    gameRenderer.showKeyInfo(vimKey);

    expect(document.body.appendChild).not.toHaveBeenCalled();
  });

  it('should handle null or undefined key gracefully', () => {
    expect(() => {
      gameRenderer.showKeyInfo(null);
    }).not.toThrow();

    expect(() => {
      gameRenderer.showKeyInfo(undefined);
    }).not.toThrow();
  });
});

describe('_showCollectibleKeyFeedback', () => {
  let gameRenderer;
  let originalAppendChild, originalRemoveChild, originalContains;

  beforeEach(() => {
    document.getElementById = jest.fn().mockReturnValue(document.createElement('div'));
    document.querySelector = jest.fn().mockReturnValue(document.createElement('div'));

    // Mock document.body methods
    originalAppendChild = document.body.appendChild;
    originalRemoveChild = document.body.removeChild;
    originalContains = document.body.contains;

    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.body.contains = jest.fn().mockReturnValue(true);

    // Mock setTimeout for testing
    jest.useFakeTimers();

    gameRenderer = new DOMGameRenderer();
  });

  afterEach(() => {
    jest.useRealTimers();

    // Restore original methods
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    document.body.contains = originalContains;
  });

  it('should create and remove feedback element with proper timing', () => {
    const collectibleKey = {
      keyId: 'secret_key',
      name: 'Secret Key'
    };

    gameRenderer._showCollectibleKeyFeedback(collectibleKey);

    expect(document.body.appendChild).toHaveBeenCalled();

    // Fast-forward time to trigger cleanup
    jest.advanceTimersByTime(2000);

    expect(document.body.removeChild).toHaveBeenCalled();
  });

  it('should handle element already removed from DOM', () => {
    document.body.contains = jest.fn().mockReturnValue(false);

    const collectibleKey = {
      keyId: 'test_key',
      name: 'Test Key'
    };

    gameRenderer._showCollectibleKeyFeedback(collectibleKey);

    jest.advanceTimersByTime(2000);

    expect(document.body.removeChild).not.toHaveBeenCalled();
  });
});

describe('render method CollectibleKey integration', () => {
  let gameRenderer;
  let mockGameState;

  beforeEach(() => {
    document.getElementById = jest.fn().mockReturnValue(document.createElement('div'));
    document.querySelector = jest.fn().mockReturnValue(document.createElement('div'));

    gameRenderer = new DOMGameRenderer();

    // Mock the update methods
    gameRenderer.updateCollectedKeysDisplay = jest.fn();
    gameRenderer.updateCollectibleInventoryDisplay = jest.fn();
    gameRenderer._updateCamera = jest.fn();

    mockGameState = {
      map: {
        width: 10,
        height: 10,
        getTileAt: jest.fn().mockReturnValue({ name: 'grass' }),
        isWalkable: jest.fn().mockReturnValue(true)
      },
      cursor: {
        position: { x: 5, y: 5, equals: jest.fn().mockReturnValue(false) }
      },
      availableKeys: [],
      availableCollectibleKeys: [],
      textLabels: [],
      npcs: [],
      collectedKeys: new Set(['h', 'j']),
      collectedCollectibleKeys: new Set(['maze_key'])
    };
  });

  it('should call both key display update methods during render', () => {
    gameRenderer.render(mockGameState);

    expect(gameRenderer.updateCollectedKeysDisplay).toHaveBeenCalledWith(mockGameState.collectedKeys);
    expect(gameRenderer.updateCollectibleInventoryDisplay).toHaveBeenCalledWith(mockGameState.collectedCollectibleKeys);
  });

  it('should handle missing collectedCollectibleKeys gracefully', () => {
    delete mockGameState.collectedCollectibleKeys;

    expect(() => {
      gameRenderer.render(mockGameState);
    }).not.toThrow();

    expect(gameRenderer.updateCollectibleInventoryDisplay).toHaveBeenCalledWith(new Set());
  });
});
