/* eslint-env node, jest */
import { jest } from '@jest/globals';
import { PersistenceService } from '../../../src/application/services/PersistenceService.js';

describe('PersistenceService', () => {
  let urlAdapter;
  let storageAdapter;
  let service;

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

    service = new PersistenceService(urlAdapter, storageAdapter);
  });

  describe('constructor', () => {
    it('should create service with adapters', () => {
      expect(service).toBeInstanceOf(PersistenceService);
      expect(service._urlAdapter).toBe(urlAdapter);
      expect(service._storageAdapter).toBe(storageAdapter);
    });
  });

  describe('getGameConfiguration', () => {
    it('should return configuration from URL parameters with priority', () => {
      urlAdapter.getParameter
        .mockReturnValueOnce('cursor-textland') // game
        .mockReturnValueOnce('level_3'); // level

      const config = service.getGameConfiguration();

      expect(config).toEqual({
        game: 'cursor-textland',
        level: 'level_3',
      });
      expect(storageAdapter.setItem).toHaveBeenCalledWith('selectedGame', 'cursor-textland');
    });

    it('should use default level for textland game from URL', () => {
      urlAdapter.getParameter
        .mockReturnValueOnce('cursor-textland') // game
        .mockReturnValueOnce(null); // level

      const config = service.getGameConfiguration();

      expect(config).toEqual({
        game: 'cursor-textland',
        level: null,
      });
    });

    it('should fallback to localStorage when no URL parameters', () => {
      urlAdapter.getParameter.mockReturnValue(null);
      storageAdapter.getItem.mockReturnValue('cursor-before-clickers');

      const config = service.getGameConfiguration();

      expect(config).toEqual({
        game: 'cursor-before-clickers',
        level: 'level_1',
      });
    });

    it('should return default configuration when no persistence found', () => {
      urlAdapter.getParameter.mockReturnValue(null);
      storageAdapter.getItem.mockReturnValue(null);

      const config = service.getGameConfiguration();

      expect(config).toEqual({
        game: 'cursor-before-clickers',
        level: 'level_1',
      });
    });

    it('should handle level parameter from URL with stored game', () => {
      urlAdapter.getParameter
        .mockReturnValueOnce(null) // game
        .mockReturnValueOnce('level_4'); // level
      storageAdapter.getItem.mockReturnValue('cursor-before-clickers');

      const config = service.getGameConfiguration();

      expect(config).toEqual({
        game: 'cursor-before-clickers',
        level: 'level_4',
      });
    });
  });

  describe('persistGameSelection', () => {
    it('should persist level-based game with level', () => {
      service.persistGameSelection('cursor-before-clickers', 'level_2');

      expect(storageAdapter.setItem).toHaveBeenCalledWith('selectedGame', 'cursor-before-clickers');
      expect(urlAdapter.setParameter).toHaveBeenCalledWith('game', 'cursor-before-clickers');
      expect(urlAdapter.setParameter).toHaveBeenCalledWith('level', 'level_2');
      expect(urlAdapter.updateURL).toHaveBeenCalled();
    });

    it('should persist textland game without level', () => {
      service.persistGameSelection('cursor-textland');

      expect(storageAdapter.setItem).toHaveBeenCalledWith('selectedGame', 'cursor-textland');
      expect(urlAdapter.setParameter).toHaveBeenCalledWith('game', 'cursor-textland');
      expect(urlAdapter.removeParameter).toHaveBeenCalledWith('level');
      expect(urlAdapter.updateURL).toHaveBeenCalled();
    });

    it('should remove level parameter for non-level games even with level provided', () => {
      service.persistGameSelection('cursor-textland', 'level_1');

      expect(urlAdapter.removeParameter).toHaveBeenCalledWith('level');
    });
  });

  describe('_getDefaultLevelForGame', () => {
    it('should return level_1 for cursor-before-clickers', () => {
      const level = service._getDefaultLevelForGame('cursor-before-clickers');
      expect(level).toBe('level_1');
    });

    it('should return null for cursor-textland', () => {
      const level = service._getDefaultLevelForGame('cursor-textland');
      expect(level).toBeNull();
    });

    it('should return null for unknown games', () => {
      const level = service._getDefaultLevelForGame('unknown-game');
      expect(level).toBeNull();
    });
  });
});
