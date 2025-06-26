/**
 * UI component responsible for level selection
 * Follows Single Responsibility Principle
 */
export class LevelSelectorUI {
  constructor(levelConfiguration = null) {
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
   * Get default level configuration
   * @private
   */
  _getDefaultLevelConfiguration() {
    return [
      { id: 'level_1', level: 'level_1' },
      { id: 'level_2', level: 'level_2' },
      { id: 'level_3', level: 'level_3' },
      { id: 'level_4', level: 'level_4' },
      { id: 'level_5', level: 'level_5' },
    ];
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    // Event listeners are automatically cleaned up when elements are removed
    this._onLevelSelected = null;
  }
}
