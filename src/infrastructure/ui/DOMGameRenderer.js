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

    for (let y = 0; y < gameState.map.size; y++) {
      for (let x = 0; x < gameState.map.size; x++) {
        const position = new Position(x, y);
        const tile = document.createElement('div');
        tile.className = 'tile';

        // Set base tile type
        const tileType = gameState.map.getTileAt(position);
        tile.classList.add(tileType.name);

        // Add player
        if (gameState.player.position.equals(position)) {
          tile.classList.add('player');
          tile.textContent = '●';
        }

        // Add collectible keys
        const key = gameState.availableKeys.find((k) => k.position.equals(position));
        if (key) {
          tile.classList.add('key');
          tile.textContent = key.key;
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
