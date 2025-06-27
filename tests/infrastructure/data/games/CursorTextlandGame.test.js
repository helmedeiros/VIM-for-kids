/* eslint-env node, jest */
import { CursorTextlandGame } from '../../../../src/infrastructure/data/games/CursorTextlandGame.js';
import { Game } from '../../../../src/domain/entities/Game.js';

describe('CursorTextlandGame', () => {
  let game;

  beforeEach(() => {
    game = CursorTextlandGame.create();
  });

  describe('create', () => {
    it('should create a Game instance', () => {
      expect(game).toBeInstanceOf(Game);
    });

    it('should have correct basic properties', () => {
      expect(game.id).toBe('cursor-textland');
      expect(game.name).toBe('Cursor and the Textland');
      expect(game.description).toContain('free-form textual world');
      expect(game.gameType.isTextland()).toBe(true);
    });

    it('should have correct level configuration', () => {
      expect(game.defaultLevel).toBe(null);
      expect(game.supportedLevels).toEqual([]);
    });

    it('should not support levels', () => {
      expect(game.supportsLevels()).toBe(false);
    });

    it('should have correct features enabled', () => {
      expect(game.features.freeExploration).toBe(true);
      expect(game.features.basicMovement).toBe(true);
      expect(game.features.openWorld).toBe(true);
      expect(game.features.experimentalMode).toBe(true);
      expect(game.features.noProgressLimits).toBe(true);
    });

    it('should have correct UI configuration', () => {
      expect(game.ui.showLevelSelector).toBe(false);
      expect(game.ui.showProgressIndicator).toBe(false);
      expect(game.ui.showKeyCollection).toBe(false);
      expect(game.ui.theme).toBe('minimal');
      expect(game.ui.enableGameSelector).toBe(true);
    });

    it('should have correct cutscene configuration', () => {
      expect(game.cutscenes.hasOriginStory).toBe(false);
      expect(game.cutscenes.hasLevelTransitions).toBe(false);
      expect(game.cutscenes.hasZoneIntros).toBe(false);
      expect(game.cutscenes.enableCutsceneSkipping).toBe(false);
    });

    it('should have correct persistence configuration', () => {
      expect(game.persistence.saveProgress).toBe(false);
      expect(game.persistence.savePosition).toBe(true);
      expect(game.persistence.saveCollectedKeys).toBe(false);
      expect(game.persistence.saveCurrentLevel).toBe(false);
      expect(game.persistence.saveCurrentZone).toBe(false);
    });

    it('should have a factory function', () => {
      expect(typeof game.factory).toBe('function');
    });

    it('should have expected features', () => {
      expect(game.hasFeature('freeExploration')).toBe(true);
      expect(game.hasFeature('openWorld')).toBe(true);
      expect(game.hasFeature('experimentalMode')).toBe(true);
      expect(game.hasFeature('levelProgression')).toBe(false);
      expect(game.hasFeature('cutscenes')).toBe(false);
    });
  });
});
