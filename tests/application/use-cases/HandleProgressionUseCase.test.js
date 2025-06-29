import { HandleProgressionUseCase } from '../../../src/application/use-cases/HandleProgressionUseCase.js';

/* eslint-env jest */
/* global global */

describe('HandleProgressionUseCase', () => {
  let mockGameState;
  let mockGameRenderer;
  let mockGameInstance;
  let handleProgressionUseCase;

  beforeEach(() => {
    // Mock game state
    mockGameState = {
      executeProgression: jest.fn(),
      shouldProgressToNextZone: jest.fn(),
      shouldProgressToNextLevel: jest.fn(),
      isGameComplete: jest.fn(),
      getCurrentZoneId: jest.fn(),
      getCurrentState: jest.fn(),
      _levelConfig: { id: 'level_1' },
    };

    // Mock game renderer
    mockGameRenderer = {
      render: jest.fn(),
      showMessage: jest.fn(),
    };

    // Mock game instance
    mockGameInstance = {
      transitionToLevel: jest.fn().mockResolvedValue(),
    };

    handleProgressionUseCase = new HandleProgressionUseCase(
      mockGameState,
      mockGameRenderer,
      mockGameInstance
    );

    // Clear console warnings for tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required dependencies', () => {
      expect(handleProgressionUseCase._gameState).toBe(mockGameState);
      expect(handleProgressionUseCase._gameRenderer).toBe(mockGameRenderer);
      expect(handleProgressionUseCase._gameInstance).toBe(mockGameInstance);
    });

    it('should work without game instance', () => {
      const useCase = new HandleProgressionUseCase(mockGameState, mockGameRenderer);
      expect(useCase._gameInstance).toBe(null);
    });
  });

  describe('execute', () => {
    it('should return none when progression is not supported', () => {
      delete mockGameState.executeProgression;

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'none', reason: 'progression_not_supported' });
    });

    it('should handle zone progression', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'zone',
        newZoneId: 'zone_2',
      });
      mockGameState.getCurrentState.mockReturnValue({ test: 'state' });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'zone', newZoneId: 'zone_2' });
      expect(mockGameRenderer.showMessage).toHaveBeenCalledWith('Progressing to zone_2...');
      expect(mockGameRenderer.render).toHaveBeenCalledWith({ test: 'state' });
    });

    it('should handle level progression', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_2',
      });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'level', nextLevelId: 'level_2' });
      expect(mockGameRenderer.showMessage).toHaveBeenCalledWith(
        'Level Complete! Progressing to level_2...'
      );
    });

    it('should handle no progression needed', () => {
      mockGameState.executeProgression.mockReturnValue({ type: 'none' });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'none' });
      expect(mockGameRenderer.showMessage).not.toHaveBeenCalled();
    });

    it('should warn about unknown progression types', () => {
      mockGameState.executeProgression.mockReturnValue({ type: 'unknown' });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'unknown' });
      expect(console.warn).toHaveBeenCalledWith('Unknown progression type: unknown');
    });
  });

  describe('shouldExecuteProgression', () => {
    it('should return true when zone progression is possible', () => {
      mockGameState.shouldProgressToNextZone.mockReturnValue(true);
      mockGameState.shouldProgressToNextLevel.mockReturnValue(false);

      const result = handleProgressionUseCase.shouldExecuteProgression();

      expect(result).toBe(true);
    });

    it('should return true when level progression is possible', () => {
      mockGameState.shouldProgressToNextZone.mockReturnValue(false);
      mockGameState.shouldProgressToNextLevel.mockReturnValue(true);

      const result = handleProgressionUseCase.shouldExecuteProgression();

      expect(result).toBe(true);
    });

    it('should return false when no progression is possible', () => {
      mockGameState.shouldProgressToNextZone.mockReturnValue(false);
      mockGameState.shouldProgressToNextLevel.mockReturnValue(false);

      const result = handleProgressionUseCase.shouldExecuteProgression();

      expect(result).toBe(false);
    });

    it('should return false when progression methods are not available', () => {
      delete mockGameState.shouldProgressToNextZone;
      delete mockGameState.shouldProgressToNextLevel;

      const result = handleProgressionUseCase.shouldExecuteProgression();

      expect(result).toBe(false);
    });
  });

  describe('level transition', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should trigger level transition through game instance', async () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_2',
      });

      handleProgressionUseCase.execute();

      // Fast-forward timers
      jest.advanceTimersByTime(2000);
      await Promise.resolve(); // Wait for async operations

      expect(mockGameInstance.transitionToLevel).toHaveBeenCalledWith('level_2');
    });

    it('should schedule level transition when no local game instance available', () => {
      // Create use case without game instance
      const useCaseWithoutInstance = new HandleProgressionUseCase(mockGameState, mockGameRenderer);

      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_2',
      });

      const result = useCaseWithoutInstance.execute();

      expect(result).toEqual({ type: 'level', nextLevelId: 'level_2' });
      expect(mockGameRenderer.showMessage).toHaveBeenCalledWith(
        'Level Complete! Progressing to level_2...'
      );
    });

    it('should handle level progression messaging correctly', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_3',
      });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'level', nextLevelId: 'level_3' });
      expect(mockGameRenderer.showMessage).toHaveBeenCalledWith(
        'Level Complete! Progressing to level_3...'
      );
    });

    it('should handle level progression with game instance correctly', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_4',
      });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'level', nextLevelId: 'level_4' });
      expect(mockGameRenderer.showMessage).toHaveBeenCalledWith(
        'Level Complete! Progressing to level_4...'
      );
      // The actual transition is scheduled asynchronously, so we just verify the immediate response
    });
  });

  describe('isGameComplete', () => {
    it('should return true when game is complete', () => {
      mockGameState.isGameComplete.mockReturnValue(true);

      const result = handleProgressionUseCase.isGameComplete();

      expect(result).toBe(true);
    });

    it('should return false when game is not complete', () => {
      mockGameState.isGameComplete.mockReturnValue(false);

      const result = handleProgressionUseCase.isGameComplete();

      expect(result).toBe(false);
    });

    it('should return false when isGameComplete method is not available', () => {
      delete mockGameState.isGameComplete;

      const result = handleProgressionUseCase.isGameComplete();

      expect(result).toBe(false);
    });
  });

  describe('getProgressionStatus', () => {
    it('should return complete progression status', () => {
      mockGameState.shouldProgressToNextZone.mockReturnValue(false);
      mockGameState.shouldProgressToNextLevel.mockReturnValue(true);
      mockGameState.isGameComplete.mockReturnValue(false);
      mockGameState.getCurrentZoneId.mockReturnValue('zone_1');

      const result = handleProgressionUseCase.getProgressionStatus();

      expect(result).toEqual({
        type: 'level',
        canProgressToZone: false,
        canProgressToLevel: true,
        isGameComplete: false,
        currentZone: 'zone_1',
        currentLevel: 'level_1',
      });
    });

    it('should return zone progression status', () => {
      mockGameState.shouldProgressToNextZone.mockReturnValue(true);
      mockGameState.shouldProgressToNextLevel.mockReturnValue(false);
      mockGameState.isGameComplete.mockReturnValue(false);
      mockGameState.getCurrentZoneId.mockReturnValue('zone_1');

      const result = handleProgressionUseCase.getProgressionStatus();

      expect(result).toEqual({
        type: 'zone',
        canProgressToZone: true,
        canProgressToLevel: false,
        isGameComplete: false,
        currentZone: 'zone_1',
        currentLevel: 'level_1',
      });
    });

    it('should return none status when no progression available', () => {
      mockGameState.shouldProgressToNextZone.mockReturnValue(false);
      mockGameState.shouldProgressToNextLevel.mockReturnValue(false);
      mockGameState.isGameComplete.mockReturnValue(false);
      mockGameState.getCurrentZoneId.mockReturnValue('zone_1');

      const result = handleProgressionUseCase.getProgressionStatus();

      expect(result).toEqual({
        type: 'none',
        canProgressToZone: false,
        canProgressToLevel: false,
        isGameComplete: false,
        currentZone: 'zone_1',
        currentLevel: 'level_1',
      });
    });

    it('should handle missing progression methods', () => {
      delete mockGameState.shouldProgressToNextZone;
      delete mockGameState.shouldProgressToNextLevel;

      const result = handleProgressionUseCase.getProgressionStatus();

      expect(result).toEqual({
        type: 'none',
        canProgressToZone: false,
        canProgressToLevel: false,
        isGameComplete: false,
      });
    });
  });

  describe('zone progression without showMessage', () => {
    it('should handle zone progression when showMessage is not available', () => {
      delete mockGameRenderer.showMessage;
      mockGameState.executeProgression.mockReturnValue({
        type: 'zone',
        newZoneId: 'zone_2',
      });
      mockGameState.getCurrentState.mockReturnValue({ test: 'state' });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'zone', newZoneId: 'zone_2' });
      expect(mockGameRenderer.render).toHaveBeenCalledWith({ test: 'state' });
    });
  });

  describe('level progression without showMessage', () => {
    it('should use alert as fallback when showMessage is not available', () => {
      delete mockGameRenderer.showMessage;
      global.alert = jest.fn();

      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_2',
      });

      const result = handleProgressionUseCase.execute();

      expect(result).toEqual({ type: 'level', nextLevelId: 'level_2' });
      expect(global.alert).toHaveBeenCalledWith('Level Complete! Progressing to level_2...');
    });
  });
});
