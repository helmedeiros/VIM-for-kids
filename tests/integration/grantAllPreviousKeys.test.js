import { VimForKidsGame } from '../../src/VimForKidsGame.js';
import { featureFlags } from '../../src/infrastructure/FeatureFlags.js';

describe('GRANT_ALL_PREVIOUS_KEYS testing flag', () => {
  let game;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="game-container">
        <div class="game-board" id="gameBoard"></div>
        <div class="collected-keys" id="collectedKeys"><div class="key-display"></div></div>
      </div>
    `;
    featureFlags.disable('GRANT_ALL_PREVIOUS_KEYS');
  });

  afterEach(() => {
    featureFlags.disable('GRANT_ALL_PREVIOUS_KEYS');
    if (game && game.cleanup) game.cleanup();
  });

  describe('_collectKeysFromPriorLevels', () => {
    it('returns an empty set when asked about the first level', () => {
      game = new VimForKidsGame();
      const keys = game._collectKeysFromPriorLevels('level_1');
      expect(keys).toBeInstanceOf(Set);
      expect(keys.size).toBe(0);
    });

    it('gathers every vim key from zones in levels before the requested level', () => {
      game = new VimForKidsGame();
      const keys = game._collectKeysFromPriorLevels('level_2');
      // Level 1 (Blinking Grove) introduces h, j, k, l in the main area
      expect(keys.has('h')).toBe(true);
      expect(keys.has('j')).toBe(true);
      expect(keys.has('k')).toBe(true);
      expect(keys.has('l')).toBe(true);
      // ...and w, b, e inside the hidden area off the main map.
      expect(keys.has('w')).toBe(true);
      expect(keys.has('b')).toBe(true);
      expect(keys.has('e')).toBe(true);
    });

    it('returns an empty set when the level id is not part of the game', () => {
      game = new VimForKidsGame();
      const keys = game._collectKeysFromPriorLevels('definitely_not_a_level');
      expect(keys.size).toBe(0);
    });
  });

  describe('feature flag wiring in _initializeGameSync', () => {
    it('leaves collectedKeys empty when the flag is off and no carryover exists', () => {
      featureFlags.disable('GRANT_ALL_PREVIOUS_KEYS');
      game = new VimForKidsGame({ level: 'level_2' });
      expect(game.gameState.collectedKeys.size).toBe(0);
    });

    it('preloads keys from prior levels when the flag is on', () => {
      featureFlags.enable('GRANT_ALL_PREVIOUS_KEYS');
      game = new VimForKidsGame({ level: 'level_2' });
      // Should now contain at least the basic motion keys from level 1
      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.collectedKeys.has('l')).toBe(true);
    });

    it('still respects carried keys over the flag when both are present', () => {
      featureFlags.enable('GRANT_ALL_PREVIOUS_KEYS');
      game = new VimForKidsGame({ level: 'level_2' });
      // Simulate a level transition setting carried keys to a custom set,
      // then re-init: carried keys should win (we don't double-merge).
      game._carriedCollectedKeys = new Set(['just_h']);
      game._initializeGameSync();
      expect(game.gameState.collectedKeys.has('just_h')).toBe(true);
      expect(game.gameState.collectedKeys.has('l')).toBe(false);
    });
  });

  describe('runtime toggle event', () => {
    it('injects prior-level keys into the live game state when the toggle event fires', () => {
      featureFlags.disable('GRANT_ALL_PREVIOUS_KEYS');
      game = new VimForKidsGame({ level: 'level_2' });
      expect(game.gameState.collectedKeys.size).toBe(0);

      featureFlags.enable('GRANT_ALL_PREVIOUS_KEYS');
      document.dispatchEvent(
        new CustomEvent('vimForKids:grantAllPreviousKeysToggled', {
          detail: { enabled: true },
        })
      );

      expect(game.gameState.collectedKeys.has('h')).toBe(true);
      expect(game.gameState.collectedKeys.has('l')).toBe(true);
    });

    it('renders through getCurrentState() so textLabels survive the re-render', () => {
      featureFlags.disable('GRANT_ALL_PREVIOUS_KEYS');
      game = new VimForKidsGame({ level: 'level_2' });
      const renderCalls = [];
      game.gameRenderer = {
        render: (state) => renderCalls.push(state),
      };

      featureFlags.enable('GRANT_ALL_PREVIOUS_KEYS');
      document.dispatchEvent(
        new CustomEvent('vimForKids:grantAllPreviousKeysToggled', {
          detail: { enabled: true },
        })
      );

      // The snapshot passed to render must include the zone's textLabels so
      // the canvas renderer's EntityIndex keeps drawing the sing-song letters.
      expect(renderCalls.length).toBeGreaterThan(0);
      const last = renderCalls[renderCalls.length - 1];
      expect(Array.isArray(last.textLabels)).toBe(true);
      expect(last.textLabels.length).toBeGreaterThan(0);
    });

    it('ignores the event when detail.enabled is false', () => {
      featureFlags.disable('GRANT_ALL_PREVIOUS_KEYS');
      game = new VimForKidsGame({ level: 'level_2' });

      document.dispatchEvent(
        new CustomEvent('vimForKids:grantAllPreviousKeysToggled', {
          detail: { enabled: false },
        })
      );

      expect(game.gameState.collectedKeys.size).toBe(0);
    });
  });
});
