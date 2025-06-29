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
              // Remove the generic npc class and add specific NPC styling
              if (npc.appearance && npc.appearance.cssClass) {
                tile.classList.add('npc', npc.appearance.cssClass);
              } else {
                tile.classList.add('npc'); // Fallback for NPCs without appearance
              }

              // Use the NPC's visual symbol or fall back to generic emoji
              if (npc.getVisualSymbol && typeof npc.getVisualSymbol === 'function') {
                tile.textContent = npc.getVisualSymbol();
              } else {
                tile.textContent = '🧙‍♂️'; // Fallback for NPCs without visual symbols
              }

              tile.title = npc.name || 'Unknown NPC';

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
}
