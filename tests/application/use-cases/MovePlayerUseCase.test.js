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
  let mockNPCInteractionUseCase;

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
    };

    mockGameRenderer = {
      render: jest.fn(),
      showKeyInfo: jest.fn(),
      showMessage: jest.fn(),
    };

    mockNPCInteractionUseCase = {
      execute: jest.fn().mockReturnValue({ interactionOccurred: false, npc: null }),
    };

    movePlayerUseCase = new MovePlayerUseCase(
      mockGameState,
      mockGameRenderer,
      null, // No progression use case
      mockNPCInteractionUseCase
    );
  });

  describe('execute', () => {
    it('should move cursor to valid position and return success', async () => {
      const result = await movePlayerUseCase.execute('right');

      expect(mockGameState.cursor.position.x).toBe(6);
      expect(mockGameState.cursor.position.y).toBe(5);
      expect(mockGameRenderer.render).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        newPosition: new Position(6, 5),
        keyCollected: null,
        npcInteraction: { interactionOccurred: false, npc: null },
        progressionResult: { type: 'none' },
      });
    });

    it('should not move cursor to invalid position and return failure', async () => {
      mockMap.isWalkable.mockReturnValue(false);

      const result = await movePlayerUseCase.execute('right');

      expect(mockGameState.cursor.position.x).toBe(5);
      expect(mockGameState.cursor.position.y).toBe(5);
      expect(mockGameRenderer.render).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        reason: 'invalid_position',
      });
    });

    it('should collect key when moving to key position', async () => {
      const key = new VimKey(new Position(6, 5), 'h', 'Move left');
      mockGameState.availableKeys = [key];

      const result = await movePlayerUseCase.execute('right');

      expect(mockGameState.collectKey).toHaveBeenCalledWith(key);
      expect(mockGameRenderer.showKeyInfo).toHaveBeenCalledWith(key);
      expect(result.keyCollected).toBe(key);
    });

    it('should handle gate walkability check', async () => {
      const mockGate = {
        position: new Position(6, 5),
        isWalkable: jest.fn().mockReturnValue(false),
      };
      mockGameState.getGate.mockReturnValue(mockGate);

      const result = await movePlayerUseCase.execute('right');

      expect(mockGameState.cursor.position.x).toBe(5);
      expect(mockGameState.cursor.position.y).toBe(5);
      expect(mockGameRenderer.render).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
    });

    it('should delegate progression to progression use case when available', async () => {
      const mockProgressionUseCase = {
        shouldExecuteProgression: jest.fn().mockReturnValue(true),
        execute: jest.fn().mockReturnValue({ type: 'zone', newZoneId: 'zone_2' }),
      };

      movePlayerUseCase = new MovePlayerUseCase(
        mockGameState,
        mockGameRenderer,
        mockProgressionUseCase,
        mockNPCInteractionUseCase
      );

      const result = await movePlayerUseCase.execute('right');

      expect(mockProgressionUseCase.shouldExecuteProgression).toHaveBeenCalled();
      expect(mockProgressionUseCase.execute).toHaveBeenCalled();
      expect(result.progressionResult).toEqual({ type: 'zone', newZoneId: 'zone_2' });
    });

    it('should not execute progression when progression use case is not available', async () => {
      const result = await movePlayerUseCase.execute('right');

      expect(result.progressionResult).toEqual({ type: 'none' });
    });

    it('should not execute progression when progression use case says no progression needed', async () => {
      const mockProgressionUseCase = {
        shouldExecuteProgression: jest.fn().mockReturnValue(false),
        execute: jest.fn(),
      };

      movePlayerUseCase = new MovePlayerUseCase(
        mockGameState,
        mockGameRenderer,
        mockProgressionUseCase,
        mockNPCInteractionUseCase
      );

      const result = await movePlayerUseCase.execute('right');

      expect(mockProgressionUseCase.shouldExecuteProgression).toHaveBeenCalled();
      expect(mockProgressionUseCase.execute).not.toHaveBeenCalled();
      expect(result.progressionResult).toEqual({ type: 'none' });
    });

    it('should handle backward compatibility with game states without gates', async () => {
      // Remove getGate method
      delete mockGameState.getGate;

      const result = await movePlayerUseCase.execute('right');

      expect(result.success).toBe(true);
      expect(mockGameRenderer.render).toHaveBeenCalled();
    });

    it('should provide synchronous executeSync method for backward compatibility', () => {
      const result = movePlayerUseCase.executeSync('right');

      expect(mockGameState.cursor.position.x).toBe(6);
      expect(mockGameState.cursor.position.y).toBe(5);
      expect(mockGameRenderer.render).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        newPosition: new Position(6, 5),
        keyCollected: null,
        npcInteraction: { interactionOccurred: false, npc: null },
        progressionResult: { type: 'none' },
      });
    });

    it('should skip progression in executeSync method', () => {
      const mockProgressionUseCase = {
        shouldExecuteProgression: jest.fn().mockReturnValue(true),
        execute: jest.fn().mockReturnValue({ type: 'zone', newZoneId: 'zone_2' }),
      };

      movePlayerUseCase = new MovePlayerUseCase(
        mockGameState,
        mockGameRenderer,
        mockProgressionUseCase,
        mockNPCInteractionUseCase
      );

      const result = movePlayerUseCase.executeSync('right');

      expect(mockProgressionUseCase.shouldExecuteProgression).not.toHaveBeenCalled();
      expect(mockProgressionUseCase.execute).not.toHaveBeenCalled();
      expect(result.progressionResult).toEqual({ type: 'none' });
    });

    it('should delegate NPC interaction to NPCInteractionUseCase', async () => {
      const mockNPC = {
        id: 'test_npc',
        name: 'Test NPC',
        position: [6, 5],
        dialogue: ['Hello!', 'Welcome to the test zone!'],
      };
      const expectedInteraction = {
        interactionOccurred: true,
        npc: mockNPC,
        dialogue: ['Hello!', 'Welcome to the test zone!'],
      };
      mockNPCInteractionUseCase.execute.mockReturnValue(expectedInteraction);

      const result = await movePlayerUseCase.execute('right');

      expect(mockNPCInteractionUseCase.execute).toHaveBeenCalledWith(
        new Position(6, 5),
        mockGameState.getCurrentState()
      );
      expect(result.npcInteraction).toBe(expectedInteraction);
    });

    it('should handle no NPC interaction when NPCInteractionUseCase returns none', async () => {
      mockNPCInteractionUseCase.execute.mockReturnValue({
        interactionOccurred: false,
        npc: null,
      });

      const result = await movePlayerUseCase.execute('right');

      expect(mockNPCInteractionUseCase.execute).toHaveBeenCalledWith(
        new Position(6, 5),
        mockGameState.getCurrentState()
      );
      expect(result.npcInteraction.interactionOccurred).toBe(false);
      expect(result.npcInteraction.npc).toBe(null);
    });

    it('should handle missing NPCInteractionUseCase gracefully', async () => {
      movePlayerUseCase = new MovePlayerUseCase(
        mockGameState,
        mockGameRenderer,
        null, // No progression use case
        null // No NPC interaction use case
      );

      const result = await movePlayerUseCase.execute('right');

      expect(result.npcInteraction.interactionOccurred).toBe(false);
      expect(result.npcInteraction.npc).toBe(null);
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
