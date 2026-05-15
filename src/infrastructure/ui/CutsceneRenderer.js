/**
 * Cutscene logic that can be tested in isolation
 * Contains pure logic without DOM dependencies
 */
export class CutsceneLogic {
  /**
   * Calculate display delay for a script line
   * @param {string} line - Script line to calculate delay for
   * @returns {number} Delay in milliseconds
   */
  static calculateLineDelay(line) {
    if (!line || typeof line !== 'string') {
      return 500; // Default for invalid lines
    }

    if (line === '') {
      return 500; // Empty lines are quick
    }

    let delay = 1500; // Default delay

    if (line.length > 50) {
      delay = 2000; // Longer lines get more time
    }

    if (line.includes('NARRATOR') || line.includes('*')) {
      delay = 2500; // Important lines get more time
    }

    return delay;
  }

  /**
   * Generate HTML for a script line based on its type
   * @param {string} line - Script line to format
   * @returns {string} HTML string for the line
   */
  static formatScriptLine(line) {
    if (typeof line !== 'string') {
      return '<div style="margin: 8px 0;"></div>';
    }

    if (line === '') {
      return '<br>';
    }

    if (line.startsWith('[') && line.endsWith(']')) {
      // Stage direction - styled differently
      return `<div style="font-style: italic; opacity: 0.8; margin: 10px 0;">${line}</div>`;
    }

    if (line.includes('NARRATOR')) {
      // Narrator line - styled prominently
      return `<div style="font-weight: bold; margin: 15px 0; color: #ffd700;">${line}</div>`;
    }

    // Regular line
    return `<div style="margin: 8px 0;">${line}</div>`;
  }

  /**
   * Validate script array
   * @param {*} script - Script to validate
   * @returns {boolean} True if script is valid
   */
  static isValidScript(script) {
    return Array.isArray(script) && script.length > 0;
  }

  /**
   * Calculate auto-complete delay based on script length
   * @param {Array} script - Script array
   * @returns {number} Auto-complete delay in milliseconds
   */
  static calculateAutoCompleteDelay(script) {
    if (!CutsceneLogic.isValidScript(script)) {
      return 2000; // Default delay
    }

    // Base delay plus extra time for longer scripts
    const baseDelay = 2000;
    const perLineDelay = 100;

    return baseDelay + script.length * perLineDelay;
  }

  /**
   * Generate overlay CSS styles based on cutscene type
   * @param {string} cutsceneType - Type of cutscene ('game', 'level', 'zone')
   * @returns {string} CSS text for the overlay
   */
  static generateOverlayStyles(cutsceneType = 'game') {
    let backgroundColor;

    switch (cutsceneType) {
      case 'game':
        // Origin Story - keep current dark background
        backgroundColor = 'rgba(0, 0, 0, 0.95)';
        break;
      case 'level':
        // Level cutscenes - dark gray background
        backgroundColor = 'rgba(64, 64, 64, 0.95)';
        break;
      case 'zone':
        // Zone cutscenes - transparent dark background
        backgroundColor = 'rgba(0, 0, 0, 0.7)';
        break;
      default:
        backgroundColor = 'rgba(0, 0, 0, 0.95)';
    }

    return `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${backgroundColor};
      color: #ffffff;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      z-index: 10000;
      cursor: pointer;
      padding: 20px;
      box-sizing: border-box;
    `;
  }

  /**
   * Generate overlay HTML content
   * @returns {string} HTML content for the overlay
   */
  static generateOverlayContent() {
    return `
      <div style="max-width: 800px; width: 100%;">
        <div id="cutscene-text" style="min-height: 200px; margin-bottom: 40px;"></div>
        <div style="font-size: 14px; opacity: 0.7;">
          Click anywhere to skip...
        </div>
      </div>
    `;
  }
}

/**
 * Infrastructure component for rendering cutscenes
 * Handles all DOM interactions for displaying origin story cutscenes
 */
export class CutsceneRenderer {
  constructor(containerElementId) {
    this._container = document.getElementById(containerElementId);
    if (!this._container) {
      throw new Error('CutsceneRenderer: Container element not found');
    }

    this._cutsceneOverlay = null;
    this._isVisible = false;
    this._completionCallback = null;
    this._currentTimeouts = [];
    // Promise tail used to serialize concurrent showCutscene calls.
    // If a second caller fires while another cutscene is still on
    // screen, this chain makes it wait — preventing two overlays from
    // stacking (which would otherwise leave one undismissable, since
    // hideCutscene only removes the most-recently-tracked overlay).
    this._showChain = Promise.resolve();
  }

  /**
   * Show a cutscene with the given cutscene story
   * @param {Object} cutsceneStory - The cutscene story to display (can be OriginStory or CutsceneStory)
   * @returns {Promise} Promise that resolves when cutscene is complete
   */
  showCutscene(cutsceneStory) {
    if (!cutsceneStory || !CutsceneLogic.isValidScript(cutsceneStory.script)) {
      return Promise.resolve();
    }

    let next;
    if (this._isVisible) {
      // Something is already on screen — queue behind it so the new
      // overlay doesn't stack on top of the current one.
      next = this._showChain.then(() => this._presentCutscene(cutsceneStory));
    } else {
      // Idle — start rendering this cutscene in the current task so
      // the overlay's DOM is available to synchronous observers.
      next = this._presentCutscene(cutsceneStory);
    }
    // Swallow rejections on the chain itself; individual callers still
    // see them via the returned `next` promise.
    this._showChain = next.catch(() => undefined);
    return next;
  }

  /**
   * Internal: render one cutscene overlay end-to-end. Should never be
   * called concurrently — `showCutscene` is the public entry point and
   * serializes via _showChain.
   * @private
   */
  _presentCutscene(cutsceneStory) {
    return new Promise((resolve) => {
      const cutsceneType = cutsceneStory.type || 'game';

      // Remember which element had focus before the overlay stole it so
      // we can hand focus back to the game board on close — keeps keyboard
      // input flowing without the player having to click the canvas first.
      this._focusBeforeCutscene =
        typeof document !== 'undefined' ? document.activeElement : null;

      this._createCutsceneOverlay(cutsceneType);
      this._isVisible = true;

      const completeHandler = () => {
        this._handleCutsceneComplete(cutsceneStory);
        resolve();
      };

      this._displayScript(cutsceneStory.script, completeHandler);
      this._cutsceneOverlay.addEventListener('click', completeHandler, { once: true });
    });
  }

  /**
   * Hide the cutscene
   */
  hideCutscene() {
    if (this._cutsceneOverlay && this._cutsceneOverlay.parentNode) {
      document.body.removeChild(this._cutsceneOverlay);
    }
    this._cutsceneOverlay = null;
    this._isVisible = false;
    this._clearTimeouts();
    // Restore keyboard focus to the canvas (or whatever element held it
    // before the cutscene) so the player can move immediately on close
    // without having to click anything first.
    this._restoreFocus();
  }

  _restoreFocus() {
    if (typeof document === 'undefined') return;
    const previous = this._focusBeforeCutscene;
    this._focusBeforeCutscene = null;
    // Prefer the focusable game canvas — that's where the keyboard
    // handler is attached — but fall back to whoever held focus when
    // the cutscene started.
    const canvas = document.getElementById('gameBoardCanvas');
    const target = canvas || (previous && typeof previous.focus === 'function' ? previous : null);
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }

  /**
   * Check if cutscene is currently visible
   * @returns {boolean} True if cutscene is visible
   */
  isCutsceneVisible() {
    return this._isVisible;
  }

  /**
   * Set completion callback
   * @param {Function} callback - Function to call when cutscene completes
   */
  onCutsceneComplete(callback) {
    this._completionCallback = callback;
  }

  /**
   * Create the cutscene overlay DOM element
   * @param {string} cutsceneType - Type of cutscene for styling
   * @private
   */
  _createCutsceneOverlay(cutsceneType = 'game') {
    this._cutsceneOverlay = document.createElement('div');
    this._cutsceneOverlay.style.cssText = CutsceneLogic.generateOverlayStyles(cutsceneType);
    this._cutsceneOverlay.innerHTML = CutsceneLogic.generateOverlayContent();
    document.body.appendChild(this._cutsceneOverlay);
  }

  /**
   * Display script lines with appropriate timing
   * @private
   */
  _displayScript(script, completeHandler) {
    const textElement = this._cutsceneOverlay.querySelector('#cutscene-text');
    let currentLineIndex = 0;

    const showNextLine = () => {
      if (currentLineIndex >= script.length) {
        // Auto-complete after showing all lines
        const autoCompleteDelay = CutsceneLogic.calculateAutoCompleteDelay(script);
        const autoCompleteTimeout = setTimeout(completeHandler, autoCompleteDelay);
        this._currentTimeouts.push(autoCompleteTimeout);
        return;
      }

      const line = script[currentLineIndex];
      currentLineIndex++;

      // Add formatted line to display
      textElement.innerHTML += CutsceneLogic.formatScriptLine(line);

      // Scroll to bottom
      textElement.scrollTop = textElement.scrollHeight;

      // Calculate delay for next line
      const delay = CutsceneLogic.calculateLineDelay(line);
      const nextLineTimeout = setTimeout(showNextLine, delay);
      this._currentTimeouts.push(nextLineTimeout);
    };

    showNextLine();
  }

  /**
   * Handle cutscene completion
   * @private
   */
  _handleCutsceneComplete(cutsceneStory) {
    if (this._completionCallback) {
      this._completionCallback(cutsceneStory);
    }
    this.hideCutscene();
  }

  /**
   * Clear all pending timeouts
   * @private
   */
  _clearTimeouts() {
    this._currentTimeouts.forEach((timeout) => clearTimeout(timeout));
    this._currentTimeouts = [];
  }
}
