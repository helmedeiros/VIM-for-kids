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
   * Show or hide level selection
   * @param {boolean} visible - Whether to show level selection
   */
  setVisible(visible) {
    const levelSelection = document.querySelector('.level-selection');
    if (levelSelection) {
      levelSelection.style.display = visible ? 'flex' : 'none';
    }
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
