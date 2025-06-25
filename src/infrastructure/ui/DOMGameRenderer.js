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
  }

  render(gameState) {
    this.gameBoard.innerHTML = '';

    // Set appropriate CSS class for different levels
    if (gameState.textLabels || gameState.gate) {
      this.gameBoard.className = 'game-board welcome-meadow';

      // Dynamically set grid dimensions for Welcome Meadow
      const mapWidth = gameState.map.width || gameState.map.size;
      const mapHeight = gameState.map.height || gameState.map.size;
      this.gameBoard.style.setProperty('--grid-cols', mapWidth);
      this.gameBoard.style.setProperty('--grid-rows', mapHeight);
    } else {
      this.gameBoard.className = 'game-board';
      // Reset to default for regular levels
      this.gameBoard.style.removeProperty('--grid-cols');
      this.gameBoard.style.removeProperty('--grid-rows');
    }

    // Handle both square and rectangular grids
    const mapWidth = gameState.map.width || gameState.map.size;
    const mapHeight = gameState.map.height || gameState.map.size;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const position = new Position(x, y);
        const tile = document.createElement('div');
        tile.className = 'tile';

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
              return n.position[0] === x && n.position[1] === y;
            }
            return false;
          });
          if (npc) {
            tile.classList.add('npc');
            tile.textContent = '🧙‍♂️'; // Wizard emoji for NPCs
            tile.title = npc.name;
          }
        }

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
}
