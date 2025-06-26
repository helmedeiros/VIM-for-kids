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
    const cursorX = gameState.cursor.position.x;
    const cursorY = gameState.cursor.position.y;
    const mapWidth = gameState.map.width || gameState.map.size;
    const mapHeight = gameState.map.height || gameState.map.size;

    // Calculate viewport center
    const viewportCenterX = Math.floor(this.camera.viewportWidth / 2);
    const viewportCenterY = Math.floor(this.camera.viewportHeight / 2);

    // Check if this is the first render or cursor position changed significantly (level change)
    const currentCursorPos = `${cursorX},${cursorY}`;
    const isFirstRender = !this.camera.isInitialized;
    const cursorPositionChanged = this.camera.lastCursorPosition !== currentCursorPos;

    // Force centering on first render or when cursor jumps to new position (level change)
    if (isFirstRender || (cursorPositionChanged && this.camera.lastCursorPosition !== null)) {
      const lastPos = this.camera.lastCursorPosition
        ? this.camera.lastCursorPosition.split(',').map(Number)
        : [0, 0];
      const distanceMoved = Math.abs(cursorX - lastPos[0]) + Math.abs(cursorY - lastPos[1]);

      // If cursor moved more than 5 tiles, it's likely a level change - force center
      if (isFirstRender || distanceMoved > 5) {
        const idealCameraX = Math.max(
          0,
          Math.min(cursorX - viewportCenterX, mapWidth - this.camera.viewportWidth)
        );
        const idealCameraY = Math.max(
          0,
          Math.min(cursorY - viewportCenterY, mapHeight - this.camera.viewportHeight)
        );

        // Set camera position immediately (no smooth scrolling for centering)
        this.camera.x = idealCameraX;
        this.camera.y = idealCameraY;
        this.camera.targetX = idealCameraX;
        this.camera.targetY = idealCameraY;
        this.camera.isInitialized = true;
        this.camera.lastCursorPosition = currentCursorPos;
        return;
      }
    }

    // Calculate ideal camera position to center cursor
    let idealCameraX = cursorX - viewportCenterX;
    let idealCameraY = cursorY - viewportCenterY;

    // Check if cursor is at scroll threshold edges
    const cursorViewportX = cursorX - this.camera.x;
    const cursorViewportY = cursorY - this.camera.y;

    const scrollThresholdX = Math.floor(this.camera.viewportWidth * this.camera.scrollThreshold);
    const scrollThresholdY = Math.floor(this.camera.viewportHeight * this.camera.scrollThreshold);

    // Horizontal scrolling
    if (cursorViewportX >= scrollThresholdX) {
      // Cursor is at 70% right edge, scroll right
      idealCameraX = cursorX - scrollThresholdX;
    } else if (cursorViewportX <= this.camera.viewportWidth - scrollThresholdX) {
      // Cursor is at 30% left edge, scroll left
      idealCameraX = cursorX - (this.camera.viewportWidth - scrollThresholdX);
    } else {
      // Keep current camera position
      idealCameraX = this.camera.targetX;
    }

    // Vertical scrolling
    if (cursorViewportY >= scrollThresholdY) {
      // Cursor is at 70% bottom edge, scroll down
      idealCameraY = cursorY - scrollThresholdY;
    } else if (cursorViewportY <= this.camera.viewportHeight - scrollThresholdY) {
      // Cursor is at 30% top edge, scroll up
      idealCameraY = cursorY - (this.camera.viewportHeight - scrollThresholdY);
    } else {
      // Keep current camera position
      idealCameraY = this.camera.targetY;
    }

    // Clamp camera to map boundaries
    idealCameraX = Math.max(0, Math.min(idealCameraX, mapWidth - this.camera.viewportWidth));
    idealCameraY = Math.max(0, Math.min(idealCameraY, mapHeight - this.camera.viewportHeight));

    // Update target position for smooth scrolling
    this.camera.targetX = idealCameraX;
    this.camera.targetY = idealCameraY;

    // Apply smooth scrolling
    if (this.camera.smoothScrolling) {
      const smoothingFactor = 0.15;
      this.camera.x += (this.camera.targetX - this.camera.x) * smoothingFactor;
      this.camera.y += (this.camera.targetY - this.camera.y) * smoothingFactor;

      // Snap to target if very close
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

    // Update last cursor position for next frame
    this.camera.lastCursorPosition = currentCursorPos;
  }

  render(gameState) {
    // Update camera position based on cursor
    this._updateCamera(gameState);

    this.gameBoard.innerHTML = '';

    // Set appropriate CSS class for different levels
    if (gameState.textLabels || gameState.gate) {
      this.gameBoard.className = 'game-board welcome-meadow';
    } else {
      this.gameBoard.className = 'game-board';
    }

    // Set viewport grid dimensions (not full map dimensions)
    this.gameBoard.style.setProperty('--grid-cols', this.camera.viewportWidth);
    this.gameBoard.style.setProperty('--grid-rows', this.camera.viewportHeight);

    // Calculate visible tile range
    const startX = Math.floor(this.camera.x);
    const startY = Math.floor(this.camera.y);

    // Render only visible tiles
    for (let viewportY = 0; viewportY < this.camera.viewportHeight; viewportY++) {
      for (let viewportX = 0; viewportX < this.camera.viewportWidth; viewportX++) {
        const worldX = startX + viewportX;
        const worldY = startY + viewportY;

        const tile = document.createElement('div');
        tile.className = 'tile';

        // Check if this tile is within the map bounds
        if (
          worldX >= 0 &&
          worldX < (gameState.map.width || gameState.map.size) &&
          worldY >= 0 &&
          worldY < (gameState.map.height || gameState.map.size)
        ) {
          const position = new Position(worldX, worldY);

          // Set base tile type
          const tileType = gameState.map.getTileAt(position);
          tile.classList.add(tileType.name);

          // Add cursor
          if (gameState.cursor.position.equals(position)) {
            tile.classList.add('cursor');
            tile.textContent = '●';
          }

          // Add collectible keys
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
                return n.position[0] === worldX && n.position[1] === worldY;
              }
              return false;
            });
            if (npc) {
              tile.classList.add('npc');
              tile.textContent = '🧙‍♂️'; // Wizard emoji for NPCs
              tile.title = npc.name;
            }
          }
        } else {
          // Outside map bounds - render as empty/void
          tile.classList.add('void');
          tile.style.backgroundColor = '#1a1a1a';
        }

        // Set explicit grid position to ensure proper alignment
        tile.style.gridColumn = viewportX + 1;
        tile.style.gridRow = viewportY + 1;

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
}
