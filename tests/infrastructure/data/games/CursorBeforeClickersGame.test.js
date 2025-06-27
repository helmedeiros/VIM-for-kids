/* eslint-env node, jest */
import { CursorBeforeClickersGame } from '../../../../src/infrastructure/data/games/CursorBeforeClickersGame.js';
import { Game } from '../../../../src/domain/entities/Game.js';

describe('CursorBeforeClickersGame', () => {
  let game;

  beforeEach(() => {
    game = CursorBeforeClickersGame.create();
  });

  describe('create', () => {
    it('should create a Game instance', () => {
      expect(game).toBeInstanceOf(Game);
    });

    it('should have correct basic properties', () => {
      expect(game.id).toBe('cursor-before-clickers');
      expect(game.name).toBe('Cursor - Before the Clickers');
      expect(game.description).toContain('Journey through mystical zones');
      expect(game.gameType.isLevelBased()).toBe(true);
    });

    it('should have correct level configuration', () => {
      expect(game.defaultLevel).toBe('level_1');
      expect(game.supportedLevels).toEqual(['level_1', 'level_2', 'level_3', 'level_4', 'level_5']);
    });

    it('should have all 5 levels configured', () => {
      expect(Object.keys(game.levels)).toHaveLength(5);
      expect(game.levels.level_1).toBeDefined();
      expect(game.levels.level_2).toBeDefined();
      expect(game.levels.level_3).toBeDefined();
      expect(game.levels.level_4).toBeDefined();
      expect(game.levels.level_5).toBeDefined();
    });

    it('should have correct level 1 configuration', () => {
      const level1 = game.levels.level_1;
      expect(level1.id).toBe('level_1');
      expect(level1.name).toBe('VIM Basics');
      expect(level1.zones).toEqual(['zone_1']);
      expect(level1.description).toContain('Blinking Grove');
    });

    it('should have correct level 2 configuration', () => {
      const level2 = game.levels.level_2;
      expect(level2.id).toBe('level_2');
      expect(level2.name).toBe('Text Manipulation');
      expect(level2.zones).toEqual(['zone_2', 'zone_3']);
      expect(level2.description).toContain('modes and word navigation');
    });

    it('should have correct features enabled', () => {
      expect(game.features.levelProgression).toBe(true);
      expect(game.features.cutscenes).toBe(true);
      expect(game.features.zoneNarration).toBe(true);
      expect(game.features.keyCollection).toBe(true);
      expect(game.features.gateUnlocking).toBe(true);
      expect(game.features.multipleZonesPerLevel).toBe(true);
      expect(game.features.progressTracking).toBe(true);
    });

    it('should have correct UI configuration', () => {
      expect(game.ui.showLevelSelector).toBe(true);
      expect(game.ui.showProgressIndicator).toBe(true);
      expect(game.ui.showKeyCollection).toBe(true);
      expect(game.ui.theme).toBe('mystical');
      expect(game.ui.enableGameSelector).toBe(true);
    });

    it('should have correct cutscene configuration', () => {
      expect(game.cutscenes.hasOriginStory).toBe(true);
      expect(game.cutscenes.hasLevelTransitions).toBe(true);
      expect(game.cutscenes.hasZoneIntros).toBe(true);
      expect(game.cutscenes.enableCutsceneSkipping).toBe(true);
    });

    it('should have correct persistence configuration', () => {
      expect(game.persistence.saveProgress).toBe(true);
      expect(game.persistence.saveCollectedKeys).toBe(true);
      expect(game.persistence.saveUnlockedZones).toBe(true);
      expect(game.persistence.saveCurrentLevel).toBe(true);
      expect(game.persistence.saveCurrentZone).toBe(true);
    });

    it('should have a factory function', () => {
      expect(typeof game.factory).toBe('function');
    });

    it('should support levels', () => {
      expect(game.supportsLevels()).toBe(true);
    });

    it('should have expected features', () => {
      expect(game.hasFeature('levelProgression')).toBe(true);
      expect(game.hasFeature('cutscenes')).toBe(true);
      expect(game.hasFeature('keyCollection')).toBe(true);
      expect(game.hasFeature('nonExistentFeature')).toBe(false);
    });
  });
});
