/* eslint-env node, jest */
import { jest } from '@jest/globals';
import { PersistenceService } from '../../../src/application/services/PersistenceService.js';

describe('PersistenceService', () => {
  let urlAdapter;
  let storageAdapter;
  let persistenceService;

  beforeEach(() => {
    urlAdapter = {
      getParameter: jest.fn(),
      setParameter: jest.fn(),
      removeParameter: jest.fn(),
      updateURL: jest.fn(),
    };

    storageAdapter = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    persistenceService = new PersistenceService(urlAdapter, storageAdapter);
  });

  describe('constructor', () => {
    it('should create service with adapters', () => {
      expect(persistenceService).toBeInstanceOf(PersistenceService);
    });
  });

  describe('getGameConfiguration', () => {
    it('should return URL configuration with highest priority', () => {
      urlAdapter.getParameter.mockImplementation((param) => {
        if (param === 'game') return 'cursor-textland';
        if (param === 'level') return 'level_2';
        return null;
      });

      const config = persistenceService.getGameConfiguration();

      expect(config).toEqual({
        game: 'cursor-textland',
        level: 'level_2',
      });
      expect(storageAdapter.setItem).toHaveBeenCalledWith('selectedGame', 'cursor-textland');
    });

    it('should fallback to localStorage', () => {
      urlAdapter.getParameter.mockReturnValue(null);
      storageAdapter.getItem.mockImplementation((key) => {
        if (key === 'selectedGame') return 'cursor-before-clickers';
        return null;
      });

      const config = persistenceService.getGameConfiguration();

      expect(config.game).toBe('cursor-before-clickers');
    });

    it('should return default configuration', () => {
      urlAdapter.getParameter.mockReturnValue(null);
      storageAdapter.getItem.mockReturnValue(null);

      const config = persistenceService.getGameConfiguration();

      expect(config.game).toBe('cursor-before-clickers');
      expect(config.level).toBe('level_1');
    });
  });

  describe('persistGameSelection', () => {
    it('should persist game and level selection', () => {
      persistenceService.persistGameSelection('cursor-before-clickers', 'level_3');

      expect(storageAdapter.setItem).toHaveBeenCalledWith('selectedGame', 'cursor-before-clickers');
      expect(urlAdapter.setParameter).toHaveBeenCalledWith('game', 'cursor-before-clickers');
      expect(urlAdapter.setParameter).toHaveBeenCalledWith('level', 'level_3');
      expect(urlAdapter.updateURL).toHaveBeenCalled();
    });

    it('should remove level parameter for non-level games', () => {
      persistenceService.persistGameSelection('cursor-textland');

      expect(urlAdapter.removeParameter).toHaveBeenCalledWith('level');
    });
  });

  describe('getCutsceneState', () => {
    it('should return cutscene state from storage', () => {
      const expectedState = {
        'cursor-before-clickers': { hasBeenShown: true },
        'cursor-textland': { hasBeenShown: false },
      };
      storageAdapter.getItem.mockReturnValue(JSON.stringify(expectedState));

      const result = persistenceService.getCutsceneState();

      expect(result).toEqual(expectedState);
      expect(storageAdapter.getItem).toHaveBeenCalledWith('cutsceneState');
    });

    it('should return empty object if no cutscene state exists', () => {
      storageAdapter.getItem.mockReturnValue(null);

      const result = persistenceService.getCutsceneState();

      expect(result).toEqual({});
    });

    it('should return empty object if cutscene state is invalid JSON', () => {
      storageAdapter.getItem.mockReturnValue('invalid json');

      const result = persistenceService.getCutsceneState();

      expect(result).toEqual({});
    });
  });

  describe('persistCutsceneState', () => {
    it('should persist cutscene state for a game', () => {
      const existingState = {
        'cursor-textland': { hasBeenShown: false },
      };
      storageAdapter.getItem.mockReturnValue(JSON.stringify(existingState));

      persistenceService.persistCutsceneState('cursor-before-clickers', { hasBeenShown: true });

      const expectedState = {
        'cursor-textland': { hasBeenShown: false },
        'cursor-before-clickers': { hasBeenShown: true },
      };

      expect(storageAdapter.setItem).toHaveBeenCalledWith(
        'cutsceneState',
        JSON.stringify(expectedState)
      );
    });

    it('should create new cutscene state if none exists', () => {
      storageAdapter.getItem.mockReturnValue(null);

      persistenceService.persistCutsceneState('cursor-before-clickers', { hasBeenShown: true });

      const expectedState = {
        'cursor-before-clickers': { hasBeenShown: true },
      };

      expect(storageAdapter.setItem).toHaveBeenCalledWith(
        'cutsceneState',
        JSON.stringify(expectedState)
      );
    });
  });

  describe('clearCutsceneState', () => {
    it('should clear all cutscene state', () => {
      persistenceService.clearCutsceneState();

      expect(storageAdapter.removeItem).toHaveBeenCalledWith('cutsceneState');
    });
  });
});
