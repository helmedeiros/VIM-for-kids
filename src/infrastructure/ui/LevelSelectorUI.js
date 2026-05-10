import { GameRegistry } from '../data/games/GameRegistry.js';

/**
 * UI component responsible for level selection
 * Follows Single Responsibility Principle
 */
export class LevelSelectorUI {
  constructor(levelConfiguration = null, gameId = 'cursor-before-clickers') {
    this._gameId = gameId;
    this._levelConfiguration = levelConfiguration || this._getDefaultLevelConfiguration();
    this._onLevelSelected = null;
    this._autoHideTimer = null;
    this._shown = false;
  }

  /**
   * Set level selection callback
   * @param {Function} callback - Callback function for level selection
   */
  onLevelSelected(callback) {
    this._onLevelSelected = callback;
  }

  /**
   * Initialize level selection UI
   */
  initialize() {
    this._createLevelButtons();
    this._setupLevelButtons();

    // Listen for visibility events from other components
    document.addEventListener('levelSelectionVisibility', (e) => {
      this.setVisible(e.detail.visible);
    });
  }

  /**
   * Set active level button
   * @param {string} levelId - Level identifier
   */
  setActiveLevel(levelId) {
    // Remove active class from all level buttons
    document.querySelectorAll('.level-btn').forEach((btn) => {
      btn.classList.remove('active');
    });

    // Add active class to the specified level button
    const activeButton = document.getElementById(levelId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  /**
   * Show or hide level selection with auto-hide after 30 seconds
   * @param {boolean} visible - Whether to show level selection
   */
  setVisible(visible) {
    if (visible) {
      this._showWithAutoHide();
    } else {
      this._hide();
    }
  }

  /**
   * Toggle level selection visibility (used by title click)
   */
  toggle() {
    if (this._shown) {
      this._hideAnimated();
    } else {
      this._showWithAutoHide();
    }
  }

  /** @private */
  _showWithAutoHide() {
    const levelSelection = document.querySelector('.level-selection');
    if (!levelSelection) return;
    clearTimeout(this._autoHideTimer);
    levelSelection.style.display = 'flex';
    levelSelection.classList.remove('hiding');
    this._shown = true;
    this._autoHideTimer = setTimeout(() => this._hideAnimated(), 30000);
  }

  /** @private */
  _hideAnimated() {
    const levelSelection = document.querySelector('.level-selection');
    if (!levelSelection || !this._shown) return;
    this._shown = false;
    clearTimeout(this._autoHideTimer);
    this._autoHideTimer = null;
    levelSelection.classList.add('hiding');
    setTimeout(() => {
      const bar = document.querySelector('.level-selection');
      if (bar) {
        bar.style.display = 'none';
        bar.classList.remove('hiding');
      }
    }, 400);
  }

  /** @private */
  _hide() {
    const levelSelection = document.querySelector('.level-selection');
    if (!levelSelection) return;
    clearTimeout(this._autoHideTimer);
    this._autoHideTimer = null;
    levelSelection.style.display = 'none';
    levelSelection.classList.remove('hiding');
    this._shown = false;
  }

  /**
   * Create level buttons dynamically
   * @private
   */
  _createLevelButtons() {
    const levelSelection = document.querySelector('.level-selection');
    if (!levelSelection) return;

    // Clear existing buttons
    levelSelection.innerHTML = '';

    // Create buttons from configuration
    this._levelConfiguration.forEach(({ id }, index) => {
      const button = document.createElement('button');
      button.id = id;
      button.className = 'level-btn';
      button.textContent = this._getLevelButtonText(id);

      // Set first button as active by default
      if (index === 0) {
        button.classList.add('active');
      }

      levelSelection.appendChild(button);
    });
  }

  /**
   * Get display text for level button
   * @private
   */
  _getLevelButtonText(levelId) {
    try {
      const game = GameRegistry.getGame(this._gameId);
      const config = game.getLevelConfiguration(levelId);
      return config ? `Level ${levelId.split('_')[1]}: ${config.name}` : levelId;
    } catch (error) {
      // Fallback to level ID if configuration not found
      return levelId;
    }
  }

  /**
   * Setup level selection buttons
   * @private
   */
  _setupLevelButtons() {
    this._levelConfiguration.forEach(({ id, level }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => {
          this.setActiveLevel(id);
          if (this._onLevelSelected) {
            this._onLevelSelected(level);
          }
        });
      }
    });
  }

  /**
   * Get default level configuration from centralized source
   * @private
   */
  _getDefaultLevelConfiguration() {
    try {
      const game = GameRegistry.getGame(this._gameId);
      return game.getAllLevelConfigurations().map((config) => ({
        id: config.id,
        level: config.id,
      }));
    } catch (error) {
      // Fallback to empty array if game not found
      return [];
    }
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    // Event listeners are automatically cleaned up when elements are removed
    this._onLevelSelected = null;
  }
}
