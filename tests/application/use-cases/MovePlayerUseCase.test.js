import { MovePlayerUseCase } from '../../../src/application/use-cases/MovePlayerUseCase.js';
import { Position } from '../../../src/domain/value-objects/Position.js';
import { Cursor } from '../../../src/domain/entities/Cursor.js';
import { VimKey } from '../../../src/domain/entities/VimKey.js';

describe('MovePlayerUseCase', () => {
  let movePlayerUseCase;
  let mockGameState;
  let mockGameRenderer;
  let mockCursor;
  let mockMap;

  beforeEach(() => {
    mockCursor = new Cursor(new Position(5, 5));

    mockMap = {
      isWalkable: jest.fn().mockReturnValue(true),
    };

    mockGameState = {
      cursor: mockCursor,
      map: mockMap,
      availableKeys: [],
      collectKey: jest.fn(),
      getCurrentState: jest.fn().mockReturnValue({}),
      getGate: jest.fn().mockReturnValue(null),
      executeProgression: jest.fn().mockReturnValue({ type: 'none' }),
    };

    mockGameRenderer = {
      render: jest.fn(),
      showKeyInfo: jest.fn(),
      showMessage: jest.fn(),
    };

    movePlayerUseCase = new MovePlayerUseCase(mockGameState, mockGameRenderer);
  });

  describe('execute', () => {
    it('should move cursor to valid position', () => {
      movePlayerUseCase.execute('right');

      expect(mockGameState.cursor.position.x).toBe(6);
      expect(mockGameState.cursor.position.y).toBe(5);
      expect(mockGameRenderer.render).toHaveBeenCalled();
    });

    it('should not move cursor to invalid position', () => {
      mockMap.isWalkable.mockReturnValue(false);

      movePlayerUseCase.execute('right');

      expect(mockGameState.cursor.position.x).toBe(5);
      expect(mockGameState.cursor.position.y).toBe(5);
      expect(mockGameRenderer.render).not.toHaveBeenCalled();
    });

    it('should collect key when moving to key position', () => {
      const key = new VimKey(new Position(6, 5), 'h', 'Move left');
      mockGameState.availableKeys = [key];

      movePlayerUseCase.execute('right');

      expect(mockGameState.collectKey).toHaveBeenCalledWith(key);
      expect(mockGameRenderer.showKeyInfo).toHaveBeenCalledWith(key);
    });

    it('should handle gate walkability check', () => {
      const mockGate = {
        position: new Position(6, 5),
        isWalkable: jest.fn().mockReturnValue(false),
      };
      mockGameState.getGate.mockReturnValue(mockGate);

      movePlayerUseCase.execute('right');

      expect(mockGameState.cursor.position.x).toBe(5);
      expect(mockGameState.cursor.position.y).toBe(5);
      expect(mockGameRenderer.render).not.toHaveBeenCalled();
    });

    it('should handle zone progression', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'zone',
        newZoneId: 'zone_2',
      });

      movePlayerUseCase.execute('right');

      expect(mockGameRenderer.showMessage).toHaveBeenCalledWith('Progressing to zone_2...');
    });

    it('should handle level progression with showMessage available', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_2',
      });

      // Mock window.vimForKidsGame
      const mockTransitionToLevel = jest.fn();
      Object.defineProperty(window, 'vimForKidsGame', {
        value: {
          transitionToLevel: mockTransitionToLevel,
        },
        writable: true,
      });

      jest.useFakeTimers();

      movePlayerUseCase.execute('right');

      expect(mockGameRenderer.showMessage).toHaveBeenCalledWith(
        'Level Complete! Progressing to level_2...'
      );

      // Fast-forward timer
      jest.advanceTimersByTime(2000);

      expect(mockTransitionToLevel).toHaveBeenCalledWith('level_2');

      jest.useRealTimers();
    });

    it('should handle level progression without showMessage (fallback to alert)', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_2',
      });

      // Remove showMessage method
      delete mockGameRenderer.showMessage;

      // Mock alert
      window.alert = jest.fn();

      // Mock window.vimForKidsGame
      const mockTransitionToLevel = jest.fn();
      Object.defineProperty(window, 'vimForKidsGame', {
        value: {
          transitionToLevel: mockTransitionToLevel,
        },
        writable: true,
      });

      jest.useFakeTimers();

      movePlayerUseCase.execute('right');

      expect(window.alert).toHaveBeenCalledWith('Level Complete! Progressing to level_2...');

      // Fast-forward timer
      jest.advanceTimersByTime(2000);

      expect(mockTransitionToLevel).toHaveBeenCalledWith('level_2');

      jest.useRealTimers();
    });

    it('should handle level progression fallback when game instance not available', () => {
      mockGameState.executeProgression.mockReturnValue({
        type: 'level',
        nextLevelId: 'level_2',
      });

      // Remove showMessage method
      delete mockGameRenderer.showMessage;

      // Remove vimForKidsGame from window
      delete window.vimForKidsGame;

      window.alert = jest.fn();

      jest.useFakeTimers();

      movePlayerUseCase.execute('right');

      expect(window.alert).toHaveBeenCalledWith('Level Complete! Progressing to level_2...');

      jest.useRealTimers();
    });

    it('should handle backward compatibility with game states without progression', () => {
      // Remove executeProgression method
      delete mockGameState.executeProgression;

      expect(() => movePlayerUseCase.execute('right')).not.toThrow();
      expect(mockGameRenderer.render).toHaveBeenCalled();
    });

    it('should handle backward compatibility with game states without gates', () => {
      // Remove getGate method
      delete mockGameState.getGate;

      expect(() => movePlayerUseCase.execute('right')).not.toThrow();
      expect(mockGameRenderer.render).toHaveBeenCalled();
    });
  });

  describe('_calculateNewPosition', () => {
    it('should throw error for invalid direction', () => {
      expect(() => movePlayerUseCase._calculateNewPosition(new Position(5, 5), 'invalid')).toThrow(
        'Invalid direction: invalid'
      );
    });

    it('should calculate correct positions for all directions', () => {
      const startPos = new Position(5, 5);

      expect(movePlayerUseCase._calculateNewPosition(startPos, 'up')).toEqual(new Position(5, 4));
      expect(movePlayerUseCase._calculateNewPosition(startPos, 'down')).toEqual(new Position(5, 6));
      expect(movePlayerUseCase._calculateNewPosition(startPos, 'left')).toEqual(new Position(4, 5));
      expect(movePlayerUseCase._calculateNewPosition(startPos, 'right')).toEqual(
        new Position(6, 5)
      );
    });
  });

  describe('_isPositionWalkable', () => {
    it('should return false if map position is not walkable', () => {
      mockMap.isWalkable.mockReturnValue(false);

      const result = movePlayerUseCase._isPositionWalkable(new Position(5, 5));

      expect(result).toBe(false);
    });

    it('should return false if gate is present and not walkable', () => {
      const mockGate = {
        position: new Position(5, 5),
        isWalkable: jest.fn().mockReturnValue(false),
      };
      mockGameState.getGate.mockReturnValue(mockGate);

      const result = movePlayerUseCase._isPositionWalkable(new Position(5, 5));

      expect(result).toBe(false);
    });

    it('should return true if gate is present and walkable', () => {
      const mockGate = {
        position: new Position(5, 5),
        isWalkable: jest.fn().mockReturnValue(true),
      };
      mockGameState.getGate.mockReturnValue(mockGate);

      const result = movePlayerUseCase._isPositionWalkable(new Position(5, 5));

      expect(result).toBe(true);
    });

    it('should return true if no gate at position', () => {
      const mockGate = {
        position: new Position(10, 10),
        isWalkable: jest.fn().mockReturnValue(false),
      };
      mockGameState.getGate.mockReturnValue(mockGate);

      const result = movePlayerUseCase._isPositionWalkable(new Position(5, 5));

      expect(result).toBe(true);
    });
  });
});
