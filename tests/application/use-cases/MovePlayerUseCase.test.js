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
      getTileAt: jest.fn().mockReturnValue({ name: 'grass' }),
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

  describe('NPC Exit Functionality', () => {
    beforeEach(() => {
      mockGameRenderer.fadeOutExistingBalloons = jest.fn();
    });

    describe('_checkNPCExit', () => {
      it('should call fadeOutExistingBalloons when leaving NPC position', async () => {
        // Mock game state with NPC at position (5, 5) and no NPC at (6, 5)
        const mockNPC = { position: new Position(5, 5) };
        mockGameState.getCurrentState.mockReturnValue({
          npcs: [mockNPC],
        });

        // Move from NPC position (5, 5) to non-NPC position (6, 5)
        const result = await movePlayerUseCase.execute('right');

        expect(mockGameRenderer.fadeOutExistingBalloons).toHaveBeenCalled();
        expect(result.success).toBe(true);
      });

      it('should not call fadeOutExistingBalloons when not leaving NPC position', async () => {
        // Mock game state with no NPCs
        mockGameState.getCurrentState.mockReturnValue({
          npcs: [],
        });

        const result = await movePlayerUseCase.execute('right');

        expect(mockGameRenderer.fadeOutExistingBalloons).not.toHaveBeenCalled();
        expect(result.success).toBe(true);
      });

      it('should not call fadeOutExistingBalloons when moving from NPC to NPC', async () => {
        // Mock game state with NPCs at both positions
        const mockNPC1 = { position: new Position(5, 5) };
        const mockNPC2 = { position: new Position(6, 5) };
        mockGameState.getCurrentState.mockReturnValue({
          npcs: [mockNPC1, mockNPC2],
        });

        const result = await movePlayerUseCase.execute('right');

        expect(mockGameRenderer.fadeOutExistingBalloons).not.toHaveBeenCalled();
        expect(result.success).toBe(true);
      });

      it('should handle missing fadeOutExistingBalloons method gracefully', async () => {
        // Remove the fadeOutExistingBalloons method
        delete mockGameRenderer.fadeOutExistingBalloons;

        const mockNPC = { position: new Position(5, 5) };
        mockGameState.getCurrentState.mockReturnValue({
          npcs: [mockNPC],
        });

        expect(async () => {
          await movePlayerUseCase.execute('right');
        }).not.toThrow();
      });

      it('should handle missing NPCInteractionUseCase gracefully', async () => {
        movePlayerUseCase = new MovePlayerUseCase(
          mockGameState,
          mockGameRenderer,
          null,
          null // No NPC interaction use case
        );

        const mockNPC = { position: new Position(5, 5) };
        mockGameState.getCurrentState.mockReturnValue({
          npcs: [mockNPC],
        });

        expect(async () => {
          await movePlayerUseCase.execute('right');
        }).not.toThrow();

        expect(mockGameRenderer.fadeOutExistingBalloons).not.toHaveBeenCalled();
      });
    });

    describe('_hasNPCAtPosition', () => {
      it('should return true when NPC exists at position', () => {
        const mockNPC = { position: new Position(5, 5) };
        const gameState = { npcs: [mockNPC] };

        const result = movePlayerUseCase._hasNPCAtPosition(new Position(5, 5), gameState);

        expect(result).toBe(true);
      });

      it('should return false when no NPC exists at position', () => {
        const mockNPC = { position: new Position(10, 10) };
        const gameState = { npcs: [mockNPC] };

        const result = movePlayerUseCase._hasNPCAtPosition(new Position(5, 5), gameState);

        expect(result).toBe(false);
      });

      it('should return false when no NPCs exist', () => {
        const gameState = { npcs: [] };

        const result = movePlayerUseCase._hasNPCAtPosition(new Position(5, 5), gameState);

        expect(result).toBe(false);
      });

      it('should handle missing npcs array gracefully', () => {
        const gameState = {};

        const result = movePlayerUseCase._hasNPCAtPosition(new Position(5, 5), gameState);

        expect(result).toBe(false);
      });

      it('should handle NPCs without position property', () => {
        const mockNPC = { id: 'npc-without-position' };
        const gameState = { npcs: [mockNPC] };

        const result = movePlayerUseCase._hasNPCAtPosition(new Position(5, 5), gameState);

        expect(result).toBe(false);
      });
    });

    describe('Ramp Movement Logic', () => {
      describe('_isRampMovementAllowed', () => {
        it('should allow movement for non-ramp tiles', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'grass' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(6, 5), 'left');

          expect(result).toBe(true);
        });

        it('should allow movement to ramp_right when moving left', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_right' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(4, 5), 'right');

          expect(result).toBe(true);
        });

        it('should block movement to ramp_right when moving right', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_right' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(6, 5), 'left');

          expect(result).toBe(false);
        });

        it('should block movement to ramp_right when moving up', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_right' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(5, 4), 'up');

          expect(result).toBe(false);
        });

        it('should block movement to ramp_right when moving down', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_right' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(5, 6), 'down');

          expect(result).toBe(false);
        });

        it('should allow movement to ramp_left when moving right', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_left' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(6, 5), 'left');

          expect(result).toBe(true);
        });

        it('should block movement to ramp_left when moving left', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_left' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(4, 5), 'right');

          expect(result).toBe(false);
        });

        it('should block movement to ramp_left when moving up', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_left' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(5, 4), 'up');

          expect(result).toBe(false);
        });

        it('should block movement to ramp_left when moving down', () => {
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_left' });

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(5, 6), 'down');

          expect(result).toBe(false);
        });

        it('should handle null tile gracefully', () => {
          mockMap.getTileAt.mockReturnValue(null);

          const result = movePlayerUseCase._isRampMovementAllowed(new Position(5, 5), 'left');

          expect(result).toBe(true);
        });
      });

      describe('Integration with _isPositionWalkable', () => {
        it('should block movement when ramp direction check fails', () => {
          mockMap.isWalkable.mockReturnValue(true);
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_right' });

          const result = movePlayerUseCase._isPositionWalkable(new Position(6, 5), 'left');

          expect(result).toBe(false);
        });

        it('should allow movement when ramp direction check passes', () => {
          mockMap.isWalkable.mockReturnValue(true);
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_right' });

          const result = movePlayerUseCase._isPositionWalkable(new Position(6, 5), 'right');

          expect(result).toBe(true);
        });

        it('should work without direction parameter (backward compatibility)', () => {
          mockMap.isWalkable.mockReturnValue(true);
          mockMap.getTileAt.mockReturnValue({ name: 'ramp_right' });

          const result = movePlayerUseCase._isPositionWalkable(new Position(6, 5));

          expect(result).toBe(true);
        });
      });
    });
  });
});
