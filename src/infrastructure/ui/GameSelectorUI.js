/**
 * Infrastructure UI adapter for game selection
 * Handles all DOM interactions for game selection interface
 */
export class GameSelectorUI {
  constructor() {
    this._isVisible = false;
    this._onGameSelected = null;
    this._currentGameId = null;
    this._initializeUI();
  }

  /**
   * Set callback for when a game is selected
   */
  onGameSelected(callback) {
    this._onGameSelected = callback;
  }

  /**
   * Show the game selector with available games
   */
  showGameSelector(games, currentGameId) {
    this._currentGameId = currentGameId;
    this._populateGames(games);
    this._showModal();
  }

  /**
   * Hide the game selector
   */
  hideGameSelector() {
    this._hideModal();
  }

  /**
   * Update the current game indicator
   */
  updateCurrentGame(gameDescriptor) {
    this._currentGameId = gameDescriptor.id;
    const titleElement = document.querySelector('.game-title');
    if (titleElement) {
      titleElement.textContent = gameDescriptor.name;
    }

    // Show/hide level selection based on game type
    this._updateLevelSelectionVisibility(gameDescriptor.gameType);
  }

  /**
   * Update level selection visibility based on game type
   * @private
   */
  _updateLevelSelectionVisibility(gameType) {
    const levelSelection = document.querySelector('.level-selection');
    if (levelSelection) {
      if (gameType.isLevelBased()) {
        // Show level selection for level-based games
        levelSelection.style.display = 'flex';
      } else {
        // Hide level selection for free exploration games
        levelSelection.style.display = 'none';
      }
    }
  }

  /**
   * Initialize the UI components
   * @private
   */
  _initializeUI() {
    this._createSettingsButton();
    this._createGameModal();
    this._addEventListeners();
  }

  /**
   * Create the settings gear button
   * @private
   */
  _createSettingsButton() {
    const settingsButton = document.createElement('button');
    settingsButton.id = 'gameSettingsButton';
    settingsButton.className = 'settings-button';
    settingsButton.innerHTML = '⚙️';
    settingsButton.title = 'Game Settings';
    settingsButton.setAttribute('aria-label', 'Open game settings');

    // Insert after the title
    const title = document.querySelector('h1');
    if (title) {
      title.parentNode.insertBefore(settingsButton, title.nextSibling);
    } else {
      document.body.appendChild(settingsButton);
    }
  }

  /**
   * Create the game selection modal
   * @private
   */
  _createGameModal() {
    const modal = document.createElement('div');
    modal.id = 'gameModal';
    modal.className = 'game-modal hidden';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Select Game</h2>
          <button class="close-button" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="games-list" id="gamesList">
            <!-- Games will be populated here -->
          </div>
        </div>
      </div>
      <div class="modal-backdrop"></div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Add event listeners
   * @private
   */
  _addEventListeners() {
    // Settings button click
    const settingsButton = document.getElementById('gameSettingsButton');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => {
        if (this._onGameSelected) {
          // Request games from the application layer
          this._onGameSelected('show-selector');
        }
      });
    }

    // Modal close events
    const modal = document.getElementById('gameModal');
    const closeButton = modal?.querySelector('.close-button');
    const backdrop = modal?.querySelector('.modal-backdrop');

    if (closeButton) {
      closeButton.addEventListener('click', () => this._hideModal());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this._hideModal());
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isVisible) {
        this._hideModal();
      }
    });
  }

  /**
   * Populate the games list
   * @private
   */
  _populateGames(games) {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;

    gamesList.innerHTML = '';

    games.forEach((game) => {
      const gameItem = document.createElement('div');
      gameItem.className = `game-item ${game.id === this._currentGameId ? 'active' : ''}`;
      gameItem.innerHTML = `
        <div class="game-info">
          <h3 class="game-name">${game.name}</h3>
          <p class="game-description">${game.description}</p>
          <span class="game-type">${this._getGameTypeLabel(game.gameType)}</span>
        </div>
      `;

      gameItem.addEventListener('click', () => {
        if (game.id !== this._currentGameId && this._onGameSelected) {
          this._onGameSelected(game.id);
          this._hideModal();
        }
      });

      gamesList.appendChild(gameItem);
    });
  }

  /**
   * Get human-readable game type label
   * @private
   */
  _getGameTypeLabel(gameType) {
    if (gameType.isLevelBased()) {
      return 'Level-based Adventure';
    } else if (gameType.isTextland()) {
      return 'Free Exploration';
    }
    return 'Unknown';
  }

  /**
   * Show the modal
   * @private
   */
  _showModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
      modal.classList.remove('hidden');
      this._isVisible = true;

      // Debug: Force styles for better visibility
      modal.style.zIndex = '99999';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.display = 'flex';

      // Focus management for accessibility
      const firstFocusable = modal.querySelector('.close-button');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  /**
   * Hide the modal
   * @private
   */
  _hideModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
      modal.classList.add('hidden');
      this._isVisible = false;

      // Clean up inline styles
      modal.style.zIndex = '';
      modal.style.position = '';
      modal.style.top = '';
      modal.style.left = '';
      modal.style.width = '';
      modal.style.height = '';
      modal.style.display = '';

      // Return focus to settings button
      const settingsButton = document.getElementById('gameSettingsButton');
      if (settingsButton) {
        settingsButton.focus();
      }
    }
  }

  /**
   * Clean up UI components
   */
  cleanup() {
    const settingsButton = document.getElementById('gameSettingsButton');
    const modal = document.getElementById('gameModal');

    if (settingsButton) {
      settingsButton.remove();
    }

    if (modal) {
      modal.remove();
    }

    this._onGameSelected = null;
  }
}
