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
      expect(balloon.className).toBe('npc-balloon');
      expect(balloon.textContent).toBe(message);

      // Balloon should be in game container, not NPC tile
      const gameContainer = document.getElementById('game-container');
      expect(gameContainer.contains(balloon)).toBe(true);
    });

    it('should remove existing balloon before creating new one', () => {
      const message1 = 'First message';
      const message2 = 'Second message';

      renderer.showNPCBalloon(mockNPC, message1);
      renderer.showNPCBalloon(mockNPC, message2);

      // Balloons are now in game container
      const gameContainer = document.getElementById('game-container');
      const balloons = gameContainer.querySelectorAll('.npc-balloon');
      expect(balloons).toHaveLength(1);
      expect(balloons[0].textContent).toBe(message2);
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
      expect(balloon.className).toBe('npc-balloon');
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
