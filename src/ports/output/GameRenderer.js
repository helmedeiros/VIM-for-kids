/**
 * Port for rendering game state to the UI
 * This interface should be implemented by UI adapters
 */
export class GameRenderer {
  /**
   * Render the complete game state
   * @param {Object} gameState - Current game state
   * @param {GameMap} gameState.map - The game map
   * @param {Cursor} gameState.cursor - The cursor
   * @param {VimKey[]} gameState.availableKeys - Available keys to collect
   * @param {Set<string>} gameState.collectedKeys - Collected key names
   */
  render(gameState) {
    // eslint-disable-line no-unused-vars
    throw new Error('GameRenderer.render() must be implemented');
  }

  /**
   * Update the collected keys display
   * @param {Set<string>} collectedKeys - Set of collected key names
   */
  updateCollectedKeysDisplay(collectedKeys) {
    // eslint-disable-line no-unused-vars
    throw new Error('GameRenderer.updateCollectedKeysDisplay() must be implemented');
  }

  /**
   * Show key information when collected
   * @param {VimKey} key - The collected key
   */
  showKeyInfo(key) {
    // eslint-disable-line no-unused-vars
    throw new Error('GameRenderer.showKeyInfo() must be implemented');
  }
}
