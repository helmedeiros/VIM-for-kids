import { GameRenderer } from '../../ports/output/GameRenderer.js';
import { Position } from '../../domain/value-objects/Position.js';

export class DOMGameRenderer extends GameRenderer {
  constructor() {
    super();
    this.gameBoard = document.getElementById('gameBoard');
    this.collectedKeysDisplay = document.querySelector('.key-display');

    // Make the game board focusable
    this.gameBoard.setAttribute('tabindex', '0');
    this.gameBoard.focus();

    // Camera system properties
    this.camera = {
      x: 0,
      y: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      tileSize: 32,
      scrollThreshold: 0.7, // 70% of viewport
      smoothScrolling: true,
      targetX: 0,
      targetY: 0,
      isInitialized: false, // Track if camera has been initialized
      lastCursorPosition: null, // Track cursor position changes
    };

    // Initialize viewport dimensions
    this._calculateViewportDimensions();

    // Listen for window resize to recalculate viewport
    window.addEventListener('resize', () => this._calculateViewportDimensions());
  }

  _calculateViewportDimensions() {
    // Calculate how many tiles fit in the viewport
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 120; // Account for UI elements

    this.camera.viewportWidth = Math.floor(screenWidth / this.camera.tileSize);
    this.camera.viewportHeight = Math.floor(screenHeight / this.camera.tileSize);

    // Ensure minimum viewport size
    this.camera.viewportWidth = Math.max(this.camera.viewportWidth, 15);
    this.camera.viewportHeight = Math.max(this.camera.viewportHeight, 10);
  }

  _updateCamera(gameState) {
    const cursorPosition = gameState.cursor.position;
    const currentPositionKey = `${cursorPosition.x},${cursorPosition.y}`;

    if (this._shouldCenterCameraOnZone(cursorPosition, currentPositionKey)) {
      this._centerCameraOnZoneStart(gameState, cursorPosition, currentPositionKey);
      return;
    }

    this._updateCameraForScrolling(gameState, cursorPosition, currentPositionKey);
  }

  _shouldCenterCameraOnZone(cursorPosition, currentPositionKey) {
    const isFirstRender = !this.camera.isInitialized;
    const hasPositionChanged = this.camera.lastCursorPosition !== currentPositionKey;

    if (!isFirstRender && !hasPositionChanged) {
      return false;
    }

    if (isFirstRender) {
      return true;
    }

    const previousPosition = this.camera.lastCursorPosition
      ? this.camera.lastCursorPosition.split(',').map(Number)
      : [0, 0];

    const manhattanDistance =
      Math.abs(cursorPosition.x - previousPosition[0]) +
      Math.abs(cursorPosition.y - previousPosition[1]);

    return manhattanDistance > 5;
  }

  _centerCameraOnZoneStart(gameState, cursorPosition, currentPositionKey) {
    const zoneContentBounds = this._findZoneContentBounds(gameState);
    const viewportCenter = this._calculateViewportCenter();
    const mapBounds = this._getMapBounds(gameState);

    const targetCameraPosition = {
      x: zoneContentBounds.x - viewportCenter.x,
      y: Math.max(
        0,
        Math.min(cursorPosition.y - viewportCenter.y, mapBounds.height - this.camera.viewportHeight)
      ),
    };

    this._setCameraPosition(targetCameraPosition);
    this.camera.isInitialized = true;
    this.camera.lastCursorPosition = currentPositionKey;
  }

  _updateCameraForScrolling(gameState, cursorPosition, currentPositionKey) {
    const viewportCenter = this._calculateViewportCenter();
    const cursorViewportPosition = this._getCursorViewportPosition(cursorPosition);
    const scrollThresholds = this._calculateScrollThresholds();
    const mapBounds = this._getMapBounds(gameState);

    const targetPosition = this._calculateScrollTargetPosition(
      cursorPosition,
      viewportCenter,
      cursorViewportPosition,
      scrollThresholds
    );

    const boundedPosition = this._clampCameraToMapBounds(targetPosition, mapBounds);

    this.camera.targetX = boundedPosition.x;
    this.camera.targetY = boundedPosition.y;

    this._applyCameraMovement();
    this.camera.lastCursorPosition = currentPositionKey;
  }

  _findZoneContentBounds(gameState) {
    const mapBounds = this._getMapBounds(gameState);
    const contentBounds = { minX: mapBounds.width, minY: mapBounds.height, maxX: 0, maxY: 0 };
    let hasContent = false;

    for (let y = 0; y < mapBounds.height; y++) {
      for (let x = 0; x < mapBounds.width; x++) {
        const tile = gameState.map.getTileAt(new Position(x, y));

        if (tile.name !== 'water') {
          hasContent = true;
          contentBounds.minX = Math.min(contentBounds.minX, x);
          contentBounds.minY = Math.min(contentBounds.minY, y);
          contentBounds.maxX = Math.max(contentBounds.maxX, x);
          contentBounds.maxY = Math.max(contentBounds.maxY, y);
        }
      }
    }

    if (!hasContent) {
      return new Position(Math.floor(mapBounds.width / 2), Math.floor(mapBounds.height / 2));
    }

    const contentHeight = contentBounds.maxY - contentBounds.minY + 1;
    const verticalCenter = contentBounds.minY + Math.floor(contentHeight / 2);

    return new Position(contentBounds.minX, verticalCenter);
  }

  _calculateViewportCenter() {
    return {
      x: Math.floor(this.camera.viewportWidth / 2),
      y: Math.floor(this.camera.viewportHeight / 2),
    };
  }

  _getMapBounds(gameState) {
    return {
      width: gameState.map.width || gameState.map.size,
      height: gameState.map.height || gameState.map.size,
    };
  }

  _setCameraPosition(targetPosition) {
    this.camera.x = targetPosition.x;
    this.camera.y = targetPosition.y;
    this.camera.targetX = targetPosition.x;
    this.camera.targetY = targetPosition.y;
  }

  _getCursorViewportPosition(cursorPosition) {
    return {
      x: cursorPosition.x - this.camera.x,
      y: cursorPosition.y - this.camera.y,
    };
  }

  _calculateScrollThresholds() {
    return {
      x: Math.floor(this.camera.viewportWidth * this.camera.scrollThreshold),
      y: Math.floor(this.camera.viewportHeight * this.camera.scrollThreshold),
    };
  }

  _calculateScrollTargetPosition(
    cursorPosition,
    viewportCenter,
    cursorViewportPosition,
    scrollThresholds
  ) {
    let targetX = cursorPosition.x - viewportCenter.x;
    let targetY = cursorPosition.y - viewportCenter.y;

    if (cursorViewportPosition.x >= scrollThresholds.x) {
      targetX = cursorPosition.x - scrollThresholds.x;
    } else if (cursorViewportPosition.x <= this.camera.viewportWidth - scrollThresholds.x) {
      targetX = cursorPosition.x - (this.camera.viewportWidth - scrollThresholds.x);
    } else {
      targetX = this.camera.targetX;
    }

    if (cursorViewportPosition.y >= scrollThresholds.y) {
      targetY = cursorPosition.y - scrollThresholds.y;
    } else if (cursorViewportPosition.y <= this.camera.viewportHeight - scrollThresholds.y) {
      targetY = cursorPosition.y - (this.camera.viewportHeight - scrollThresholds.y);
    } else {
      targetY = this.camera.targetY;
    }

    return { x: targetX, y: targetY };
  }

  _clampCameraToMapBounds(targetPosition, mapBounds) {
    return {
      x: Math.min(targetPosition.x, mapBounds.width - this.camera.viewportWidth),
      y: Math.max(0, Math.min(targetPosition.y, mapBounds.height - this.camera.viewportHeight)),
    };
  }

  _applyCameraMovement() {
    if (this.camera.smoothScrolling) {
      const smoothingFactor = 0.15;
      this.camera.x += (this.camera.targetX - this.camera.x) * smoothingFactor;
      this.camera.y += (this.camera.targetY - this.camera.y) * smoothingFactor;

      if (Math.abs(this.camera.targetX - this.camera.x) < 0.1) {
        this.camera.x = this.camera.targetX;
      }
      if (Math.abs(this.camera.targetY - this.camera.y) < 0.1) {
        this.camera.y = this.camera.targetY;
      }
    } else {
      this.camera.x = this.camera.targetX;
      this.camera.y = this.camera.targetY;
    }
  }

  render(gameState) {
    this._updateCamera(gameState);
    this.gameBoard.innerHTML = '';

    if (gameState.textLabels || gameState.gate) {
      this.gameBoard.className = 'game-board welcome-meadow';
    } else {
      this.gameBoard.className = 'game-board';
    }

    this.gameBoard.style.setProperty('--grid-cols', this.camera.viewportWidth);
    this.gameBoard.style.setProperty('--grid-rows', this.camera.viewportHeight);

    const cameraTopLeft = {
      x: Math.floor(this.camera.x),
      y: Math.floor(this.camera.y),
    };

    for (let row = 0; row < this.camera.viewportHeight; row++) {
      for (let col = 0; col < this.camera.viewportWidth; col++) {
        const worldPosition = {
          x: cameraTopLeft.x + col,
          y: cameraTopLeft.y + row,
        };

        const tile = document.createElement('div');
        tile.className = 'tile';

        if (
          worldPosition.x >= 0 &&
          worldPosition.x < (gameState.map.width || gameState.map.size) &&
          worldPosition.y >= 0 &&
          worldPosition.y < (gameState.map.height || gameState.map.size)
        ) {
          const position = new Position(worldPosition.x, worldPosition.y);
          const tileType = gameState.map.getTileAt(position);
          tile.classList.add(tileType.name);

          if (gameState.cursor.position.equals(position)) {
            tile.classList.add('cursor');
            tile.textContent = '●';
          }

          const key = gameState.availableKeys.find((k) => k.position.equals(position));
          if (key) {
            tile.classList.add('key');
            tile.textContent = key.key;
          }

          // Add text labels for Welcome Meadow
          if (gameState.textLabels) {
            const textLabel = gameState.textLabels.find((label) => label.position.equals(position));
            if (textLabel) {
              tile.classList.add('text-label');
              const labelSpan = document.createElement('span');
              labelSpan.textContent = textLabel.text;
              labelSpan.style.color = textLabel.color;
              labelSpan.style.fontSize = textLabel.fontSize;
              labelSpan.style.position = 'absolute';
              labelSpan.style.bottom = '2px';
              labelSpan.style.left = '50%';
              labelSpan.style.transform = 'translateX(-50%)';
              tile.appendChild(labelSpan);
            }
          }

          // Add gate for Welcome Meadow
          if (gameState.gate && gameState.gate.position.equals(position)) {
            tile.classList.add('gate');
            tile.classList.add(gameState.gate.isOpen ? 'open' : 'closed');
            tile.textContent = gameState.gate.isOpen ? '🚪' : '🚧';
          }

          // Add NPCs
          if (gameState.npcs) {
            const npc = gameState.npcs.find((n) => {
              if (n.position && Array.isArray(n.position)) {
                return n.position[0] === worldPosition.x && n.position[1] === worldPosition.y;
              }
              return false;
            });
            if (npc) {
              // Determine NPC CSS class based on ID or type
              const npcCssClass = this._getNpcCssClass(npc);

              tile.classList.add('npc', npcCssClass);

              // Use the NPC's visual symbol or fall back based on type
              if (npc.getVisualSymbol && typeof npc.getVisualSymbol === 'function') {
                tile.textContent = npc.getVisualSymbol();
              } else {
                tile.textContent = this._getNpcFallbackSymbol(npc);
              }

              tile.title = npc.name || npc.id || 'Unknown NPC';

              // Add floating glyphs for enhanced visual effect
              if (npc.getFloatingGlyph && typeof npc.getFloatingGlyph === 'function') {
                const glyphSpan = document.createElement('span');
                glyphSpan.className = 'floating-glyph';
                glyphSpan.textContent = npc.getFloatingGlyph();
                tile.appendChild(glyphSpan);
              }
            }
          }
        } else {
          tile.classList.add('water');
        }

        tile.style.gridColumn = col + 1;
        tile.style.gridRow = row + 1;

        this.gameBoard.appendChild(tile);
      }
    }

    this.updateCollectedKeysDisplay(gameState.collectedKeys);
  }

  updateCollectedKeysDisplay(collectedKeys) {
    this.collectedKeysDisplay.innerHTML = '';

    if (collectedKeys.size === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No keys collected yet!';
      emptyMessage.style.color = '#95a5a6';
      emptyMessage.style.fontStyle = 'italic';
      this.collectedKeysDisplay.appendChild(emptyMessage);
    } else {
      collectedKeys.forEach((keyName) => {
        const keyElement = document.createElement('div');
        keyElement.className = 'collected-key';
        keyElement.textContent = keyName;
        this.collectedKeysDisplay.appendChild(keyElement);
      });
    }
  }

  showKeyInfo() {
    // Key collection feedback is now handled by the visual UI only
    // No popup needed - the key appears in the collected keys display
  }

  focus() {
    this.gameBoard.focus();
  }

  // Reset camera for level changes
  resetCamera() {
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.targetX = 0;
    this.camera.targetY = 0;
    this.camera.isInitialized = false;
    this.camera.lastCursorPosition = null;
  }

  /**
   * Determine the appropriate CSS class for an NPC based on its ID or type
   * @param {Object} npc - The NPC object
   * @returns {string} - The CSS class name
   */
  _getNpcCssClass(npc) {
    // If NPC has appearance.cssClass, use it directly
    if (npc.appearance && npc.appearance.cssClass) {
      return npc.appearance.cssClass.replace('npc-', ''); // Remove npc- prefix for CSS
    }

    // Map NPC IDs to CSS classes
    const npcIdToCssClass = {
      caret_spirit: 'caret-spirit',
      syntax_wisp: 'syntax-wisp',
      bug_king: 'bug-king',
      bug_king_boss: 'bug-king',
      caret_stone: 'caret-stone',
      maze_scribe: 'maze-scribe',
      mode_guardian: 'maze-scribe', // Legacy ID maps to maze-scribe styling
      deletion_echo: 'deletion-echo',
      insert_scribe: 'insert-scribe',
      scribe_poet: 'insert-scribe', // Legacy ID maps to insert-scribe styling
      the_yanker: 'practice-buddy', // The Yanker gets cheerful styling
      mirror_sprite: 'mirror-sprite',
      reflection_spirit: 'mirror-sprite', // Legacy ID maps to mirror-sprite styling
      practice_buddy: 'practice-buddy',
      practice_spirit_1: 'practice-buddy',
      practice_spirit_2: 'practice-buddy',
      practice_spirit_3: 'practice-buddy',
      final_encourager: 'practice-buddy',
      syntax_spirit: 'maze-scribe', // Syntax spirit gets mystical scribe styling
      word_witch: 'deletion-echo', // Word witch gets spooky styling
    };

    // Try to match by ID first
    if (npc.id && npcIdToCssClass[npc.id]) {
      return npcIdToCssClass[npc.id];
    }

    // Try to match by type
    if (npc.type && npcIdToCssClass[npc.type]) {
      return npcIdToCssClass[npc.type];
    }

    // Default fallback
    return '';
  }

  /**
   * Get fallback symbol for NPCs without getVisualSymbol method
   * @param {Object} npc - The NPC object
   * @returns {string} - The fallback symbol
   */
  _getNpcFallbackSymbol(npc) {
    // Map NPC IDs/types to fallback symbols
    const npcSymbols = {
      caret_spirit: '🔥',
      syntax_wisp: '~',
      bug_king: '♛',
      bug_king_boss: '♛',
      caret_stone: '🗿',
      maze_scribe: '📜',
      mode_guardian: '📜',
      deletion_echo: '👻',
      insert_scribe: '✏️',
      scribe_poet: '✏️',
      the_yanker: '🎉',
      mirror_sprite: '💧',
      reflection_spirit: '💧',
      practice_buddy: '🎉',
      practice_spirit_1: '🎉',
      practice_spirit_2: '🎉',
      practice_spirit_3: '🎉',
      final_encourager: '🎉',
      syntax_spirit: '📜',
      word_witch: '👻',
    };

    // Try to match by ID first
    if (npc.id && npcSymbols[npc.id]) {
      return npcSymbols[npc.id];
    }

    // Try to match by type
    if (npc.type && npcSymbols[npc.type]) {
      return npcSymbols[npc.type];
    }

    // Default fallback
    return '🧙‍♂️';
  }

  /**
   * Show a message bubble on screen
   * @param {string} message - The message to display
   * @param {Object} options - Display options
   */
  showMessage(message, options = {}) {
    const { duration = 4000, position = 'center', type = 'info', speaker = null } = options;

    // Remove any existing message
    this.hideMessage();

    // Create message bubble
    const messageElement = document.createElement('div');
    messageElement.className = `message-bubble ${type}`;
    messageElement.setAttribute('data-position', position);

    // Add speaker name if provided
    if (speaker) {
      const speakerElement = document.createElement('div');
      speakerElement.className = 'message-speaker';
      speakerElement.textContent = speaker;
      messageElement.appendChild(speakerElement);
    }

    // Add message text
    const textElement = document.createElement('div');
    textElement.className = 'message-text';
    textElement.textContent = message;
    messageElement.appendChild(textElement);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'message-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.hideMessage();
    messageElement.appendChild(closeButton);

    // Add to game container
    const gameContainer = document.getElementById('game-container') || document.body;
    gameContainer.appendChild(messageElement);

    // Store reference for cleanup
    this.currentMessage = messageElement;

    // Auto-hide after duration (if not set to 0)
    if (duration > 0) {
      this.messageTimeout = setTimeout(() => {
        this.hideMessage();
      }, duration);
    }

    return messageElement;
  }

  /**
   * Hide the current message bubble
   */
  hideMessage() {
    if (this.currentMessage) {
      this.currentMessage.remove();
      this.currentMessage = null;
    }
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
  }

    /**
   * Show NPC dialogue with proper formatting
   * @param {Object} npc - The NPC speaking
   * @param {Array<string>|string} dialogue - The dialogue lines
   * @param {Object} options - Display options
   */
    showNPCDialogue(npc, dialogue, options = {}) {
    const dialogueText = Array.isArray(dialogue) ? dialogue.join(' ') : dialogue.toString();

    // All NPC dialogue uses clean white balloons above NPCs
    return this.showNPCBalloon(npc, dialogueText, options);
  }

  /**
   * Show NPC message without close button (auto-closes only)
   * @param {string} message - The message to display
   * @param {Object} options - Display options
   */
  showNPCMessage(message, options = {}) {
    const { duration = 4000, position = 'center', type = 'info', speaker = null } = options;

    // Remove any existing message
    this.hideMessage();

    // Create message bubble
    const messageElement = document.createElement('div');
    messageElement.className = `message-bubble ${type}`;
    messageElement.setAttribute('data-position', position);

    // Add speaker name if provided
    if (speaker) {
      const speakerElement = document.createElement('div');
      speakerElement.className = 'message-speaker';
      speakerElement.textContent = speaker;
      messageElement.appendChild(speakerElement);
    }

    // Add message text
    const textElement = document.createElement('div');
    textElement.className = 'message-text';
    textElement.textContent = message;
    messageElement.appendChild(textElement);

    // NO CLOSE BUTTON for NPC messages - they auto-close only

    // Add to game container
    const gameContainer = document.getElementById('game-container') || document.body;
    gameContainer.appendChild(messageElement);

    // Store reference for cleanup
    this.currentMessage = messageElement;

    // Auto-hide after duration (must auto-close since no close button)
    if (duration > 0) {
      this.messageTimeout = setTimeout(() => {
        this.hideMessage();
      }, duration);
    }

    return messageElement;
  }

  /**
   * Show clean white balloon above NPC
   * @param {Object} npc - The NPC speaking
   * @param {string} message - The message to display
   * @param {Object} options - Display options
   */
  showNPCBalloon(npc, message, options = {}) {
    const { duration = 4000 } = options;

    // Find the NPC tile in the DOM
    const npcTile = this._findNPCTile(npc);

    if (!npcTile) {
      return this.showMessage(message, { type: 'dialogue', duration });
    }

    // Remove any existing balloons
    const gameContainer = document.getElementById('game-container') || document.body;
    const existingBalloons = gameContainer.querySelectorAll('.npc-balloon');
    existingBalloons.forEach(balloon => balloon.remove());

    // Create balloon element - CSS handles styling and text containment
    const balloon = document.createElement('div');
    balloon.className = 'npc-balloon';
    balloon.textContent = message;

    // Simple positioning: place above NPC using getBoundingClientRect
    const npcRect = npcTile.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    // Add to container first to get proper measurements
    gameContainer.appendChild(balloon);

        // Position balloon centered above NPC with proper spacing
    const npcCenterX = npcRect.left - containerRect.left + (npcRect.width / 2);
    balloon.style.left = npcCenterX + 'px';

    // Position balloon so the arrow tip appears just above the NPC
    // We need: balloon height + arrow extension (8px from CSS) + small gap (10px)
    // The arrow extends 8px below the balloon, so we need balloon height + 8px + 10px gap
    const balloonRect = balloon.getBoundingClientRect();
    const balloonHeight = balloonRect.height || 50; // Fallback height
    balloon.style.top = (npcRect.top - containerRect.top - balloonHeight - 18) + 'px'; // 8px arrow + 10px gap
    balloon.style.transform = 'translateX(-50%)'; // Center horizontally

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        if (balloon.parentNode) {
          balloon.remove();
        }
      }, duration);
    }

    return balloon;
  }





  /**
   * Find the DOM element for a specific NPC
   * @param {Object} npc - The NPC to find
   * @returns {Element|null} - The NPC tile element or null
   * @private
   */
  _findNPCTile(npc) {
    const npcName = npc.name || npc.id || 'Unknown NPC';

    if (!this.gameBoard) {
      return null;
    }

    // Find tile with matching title
    const tiles = this.gameBoard.querySelectorAll('.tile.npc');

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      if (tile.title === npcName) {
        return tile;
      }
    }

    return null;
  }
}
