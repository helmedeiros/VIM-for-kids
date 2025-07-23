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

  describe('Column Memory Navigation', () => {
    beforeEach(() => {
      // Setup a map with some water and walkable areas to test column memory
      mockMap.width = 10;
      mockMap.height = 10;
      mockMap.isWalkable.mockImplementation((position) => {
        // Create a pattern: rows 0-2 full width walkable, row 3 only columns 0-5 walkable
        if (position.y === 0 || position.y === 1 || position.y === 2) {
          return position.x >= 0 && position.x < 10;
        }
        if (position.y === 3) {
          return position.x >= 0 && position.x < 6; // Shorter "line"
        }
        if (position.y === 4) {
          return position.x >= 0 && position.x < 10; // Full width again
        }
        return false;
      });
    });

    it('should remember column when moving vertically through water', () => {
      // Create a water-based scenario for column memory
      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;
        // Row 3: water in middle columns (6-9), grass elsewhere
        if (y === 3 && x >= 6 && x <= 9) {
          return { name: 'water' };
        }
        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const { x, y } = position;
        // Row 2: all walkable
        if (y === 2) return true;
        // Row 3: water blocks columns 6-9
        if (y === 3) return x < 6 || x > 9;
        // Row 4: all walkable again
        if (y === 4) return true;
        return false;
      });

      // Start at column 8, row 2
      mockGameState.cursor = new Cursor(new Position(8, 2));

      // Move down - hits water, should use column memory
      movePlayerUseCase.executeSync('down');

      // Should find nearest walkable to column 8 (either column 5 or 10)
      const afterWater = mockGameState.cursor.position;
      expect(afterWater.y).toBe(3);
      expect(afterWater.x === 5 || afterWater.x === 10).toBe(true);
      expect(mockGameState.cursor.rememberedColumn).toBe(8); // Should remember original

      // Move down again to full-width row
      movePlayerUseCase.executeSync('down');

      // Should return to remembered column 8
      expect(mockGameState.cursor.position.x).toBe(8);
      expect(mockGameState.cursor.position.y).toBe(4);
      expect(mockGameState.cursor.rememberedColumn).toBe(8);
    });

    it('should update remembered column on horizontal movement', () => {
      // Start at column 3, row 1
      mockGameState.cursor = new Cursor(new Position(3, 1));

      // Move right
      movePlayerUseCase.executeSync('right');

      // Should update remembered column
      expect(mockGameState.cursor.position.x).toBe(4);
      expect(mockGameState.cursor.rememberedColumn).toBe(4);
    });

    it('should find nearest walkable position when preferred column is not available in water', () => {
      // Create water scenario
      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;
        // Row 3: water from columns 6-9
        if (y === 3 && x >= 6 && x <= 9) {
          return { name: 'water' };
        }
        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const { x, y } = position;
        if (y === 2) return true; // Row 2 all walkable
        if (y === 3) return x < 6; // Row 3 only columns 0-5 walkable (water blocks 6-9)
        return false;
      });

      // Start at column 9 (far right), row 2
      mockGameState.cursor = new Cursor(new Position(9, 2));

      // Move down - should hit water and find nearest walkable
      movePlayerUseCase.executeSync('down');

      // Should find the nearest walkable position (column 5)
      expect(mockGameState.cursor.position.x).toBe(5);
      expect(mockGameState.cursor.position.y).toBe(3);
      expect(mockGameState.cursor.rememberedColumn).toBe(9);
    });

    it('should follow the exact movement pattern from the image (positions 1-8)', () => {
      // Setup map to match the image layout
      mockMap.width = 20;
      mockMap.height = 12;

      // Define tile types for the map
      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Areas that should be water (blue in image) - these will use column memory
        if (y === 6 && x >= 4 && x <= 7) return { name: 'water' }; // Water gap in row 6
        if (y === 6 && x >= 11 && x <= 15) return { name: 'water' }; // Water gap in row 6
        if (y === 9 && x >= 4 && x <= 15) return { name: 'water' }; // Water area in row 9

        // Everything else is grass or stone (walkable when specified)
        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        // Recreate the map pattern from the image
        // Blue = water (not walkable), Green = grass (walkable), Gray/Brown = stone/dirt (walkable)

        const { x, y } = position;

        // Row 0-2: Mostly water (blue) with some grass on the right
        if (y <= 2) {
          return x >= 16; // Only rightmost columns are walkable (green area)
        }

        // Row 3: Mixed - water in middle, grass on sides
        if (y === 3) {
          return (x >= 8 && x <= 12) || x >= 16; // Grass areas
        }

        // Row 4: Has grass area around column 11-12, and right side
        if (y === 4) {
          return (x >= 8 && x <= 12) || x >= 16;
        }

        // Row 5: Similar pattern - grass in specific areas
        if (y === 5) {
          return (x >= 8 && x <= 12) || x >= 16;
        }

        // Row 6: Water in middle, walkable on left (stone) and right (grass)
        if (y === 6) {
          return x <= 3 || (x >= 8 && x <= 10) || x >= 16;
        }

        // Row 7: Similar to row 6
        if (y === 7) {
          return x <= 3 || (x >= 8 && x <= 10) || x >= 16;
        }

        // Row 8: More grass area available
        if (y === 8) {
          return x <= 3 || x >= 8;
        }

        // Row 9+: Mostly water
        return x <= 3 || x >= 16;
      });

      // Start at the orange cursor position (column 12, row 3)
      const startPosition = new Position(12, 3);
      mockGameState.cursor = new Cursor(startPosition);

      // Verify starting position
      expect(mockGameState.cursor.position).toEqual(startPosition);
      expect(mockGameState.cursor.rememberedColumn).toBe(12);

      // Position 1: Move down - should stay at column 12 since it's walkable
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position).toEqual(new Position(12, 4));
      expect(mockGameState.cursor.rememberedColumn).toBe(12);

      // Position 2: Move down - should stay at column 12
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position).toEqual(new Position(12, 5));
      expect(mockGameState.cursor.rememberedColumn).toBe(12);

      // Position 3: Move down - column 12 not available, should find nearest (column 10)
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position).toEqual(new Position(10, 6));
      expect(mockGameState.cursor.rememberedColumn).toBe(12); // Still remembers original

      // Position 4: Move down - should stay at nearest available (column 10)
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position).toEqual(new Position(10, 7));
      expect(mockGameState.cursor.rememberedColumn).toBe(12);

      // Position 5: Move down - column 12 becomes available again, should return to it
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position).toEqual(new Position(12, 8));
      expect(mockGameState.cursor.rememberedColumn).toBe(12);

      // Position 6: Move down - column 12 not available, should go to nearest (right side)
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position.y).toBe(9);
      expect(mockGameState.cursor.position.x).toBeGreaterThanOrEqual(16); // Should be in right walkable area
      expect(mockGameState.cursor.rememberedColumn).toBe(12);

      // Position 7: Move down - should stay in the available area
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position.y).toBe(10);
      expect(mockGameState.cursor.rememberedColumn).toBe(12);

      // Position 8: Move down - should continue in available area
      movePlayerUseCase.executeSync('down');
      expect(mockGameState.cursor.position.y).toBe(11);
      expect(mockGameState.cursor.rememberedColumn).toBe(12);
    });

    it('should not move into maze when trying to move into water from grass island', () => {
      // Setup map to match the new image layout
      mockMap.width = 30;
      mockMap.height = 15;
      mockMap.isWalkable.mockImplementation((position) => {
        // Recreate the map pattern from the new image
        // Blue = water (not walkable), Green = grass island (walkable), Gray/Brown = maze (walkable but should be avoided)

        const { x, y } = position;

        // Define the grass island area (middle-left green area)
        const isGrassIsland = (x >= 12 && x <= 20 && y >= 6 && y <= 11);

        // Define the maze area (right side stone/dirt area)
        const isMazeArea = (x >= 22 && x <= 28 && y >= 3 && y <= 12);

        // Everything else is water (not walkable)
        return isGrassIsland || isMazeArea;
      });

      // Start at the center of the grass island
      const startPosition = new Position(16, 8);
      mockGameState.cursor = new Cursor(startPosition);

      // Verify starting position
      expect(mockGameState.cursor.position).toEqual(startPosition);
      expect(mockGameState.cursor.rememberedColumn).toBe(16);

      // Try to move up (into water) - should not move into maze
      const initialPosition = mockGameState.cursor.position;
      movePlayerUseCase.executeSync('up');

      // Should either stay in place or move within the grass island, but NOT into the maze
      const newPosition = mockGameState.cursor.position;

      // Cursor should not move into the maze area (x >= 22)
      expect(newPosition.x).toBeLessThan(22);

      // If it moved, it should still be in the grass island or stay in place
      if (!newPosition.equals(initialPosition)) {
        expect(newPosition.x).toBeGreaterThanOrEqual(12);
        expect(newPosition.x).toBeLessThanOrEqual(20);
        expect(newPosition.y).toBeGreaterThanOrEqual(6);
        expect(newPosition.y).toBeLessThanOrEqual(11);
      }

            // Try to move right (toward water/maze boundary) - should not jump into maze
      movePlayerUseCase.executeSync('right');

      const afterRightMove = mockGameState.cursor.position;

      // Should not jump into the maze
      expect(afterRightMove.x).toBeLessThan(22);

      // Try to move down (into water) - should not move into maze
      movePlayerUseCase.executeSync('down');

      const afterDownMove = mockGameState.cursor.position;

      // Should not move into maze area
      expect(afterDownMove.x).toBeLessThan(22);

      // Try to move left (into water) - should stay within bounds
      movePlayerUseCase.executeSync('left');

      const afterLeftMove = mockGameState.cursor.position;

      // Should stay within grass island or not move at all
      expect(afterLeftMove.x).toBeGreaterThanOrEqual(12);
      expect(afterLeftMove.x).toBeLessThan(22); // Definitely not in maze
    });

    it('should not search more than 5 spaces away from remembered column', () => {
      // Setup a map where the nearest walkable tile is more than 5 spaces away (water scenario)
      mockMap.width = 20;
      mockMap.height = 10;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 6: water in the middle area (columns 4-16)
        if (y === 6 && x >= 4 && x <= 16) {
          return { name: 'water' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const { x, y } = position;

        // Row 5: Only column 10 is walkable (middle)
        if (y === 5) {
          return x === 10;
        }

        // Row 6: Water blocks columns 4-16, only columns 0-3 and 17-19 are walkable (far from center)
        if (y === 6) {
          return (x >= 0 && x <= 3) || (x >= 17 && x <= 19);
        }

        // Other rows have no walkable tiles
        return false;
      });

      // Start at column 10, row 5 (center)
      const startPosition = new Position(10, 5);
      mockGameState.cursor = new Cursor(startPosition);

      // Verify starting position
      expect(mockGameState.cursor.position).toEqual(startPosition);
      expect(mockGameState.cursor.rememberedColumn).toBe(10);

      // Try to move down - nearest walkable tiles are at columns 0-3 (7+ spaces away) and 17-19 (7+ spaces away)
      // Should not move because both are more than 5 spaces away from remembered column 10
      movePlayerUseCase.executeSync('down');

      // Should stay in the same position since no walkable tile within 5 spaces
      expect(mockGameState.cursor.position).toEqual(startPosition);
      expect(mockGameState.cursor.rememberedColumn).toBe(10); // Should preserve remembered column
    });

    it('should move to walkable tile within 5 spaces of remembered column', () => {
      // Setup a map where there's a walkable tile exactly 5 spaces away (water scenario)
      mockMap.width = 20;
      mockMap.height = 10;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 6: water between walkable areas
        if (y === 6 && x >= 6 && x <= 14) {
          return { name: 'water' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const { x, y } = position;

        // Row 5: Only column 10 is walkable (starting position)
        if (y === 5) {
          return x === 10;
        }

        // Row 6: Water blocks columns 6-14, walkable at columns 5 and 15
        if (y === 6) {
          return x === 5 || x === 15;
        }

        return false;
      });

      // Start at column 10, row 5
      const startPosition = new Position(10, 5);
      mockGameState.cursor = new Cursor(startPosition);

      // Move down - should move to column 5 or 15 (both exactly 5 spaces away)
      movePlayerUseCase.executeSync('down');

      const newPosition = mockGameState.cursor.position;

      // Should move to one of the valid positions (prefer closer one - column 5 or 15)
      expect(newPosition.y).toBe(6);
      expect(newPosition.x === 5 || newPosition.x === 15).toBe(true);
      expect(mockGameState.cursor.rememberedColumn).toBe(10); // Should preserve remembered column
    });

    it('should trigger column memory when moving from walkable to water areas', () => {
      // Test the specific scenario: moving from walkable tiles into water
      mockMap.width = 15;
      mockMap.height = 6;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2: all grass (walkable)
        if (y === 2) return { name: 'grass' };

        // Row 3: water in middle columns (5-9), grass on sides
        if (y === 3) {
          if (x >= 5 && x <= 9) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 7 (which will be water in the next row)
      mockGameState.cursor = new Cursor(new Position(7, 2));

      // Move down - target position (7,3) is water, should use column memory
      movePlayerUseCase.executeSync('down');

      const result = mockGameState.cursor.position;

      // Should use column memory to find nearest walkable position (column 4 or 10)
      expect(result.y).toBe(3);
      expect(result.x === 4 || result.x === 10).toBe(true); // Should find nearest walkable
      expect(mockGameState.cursor.rememberedColumn).toBe(7); // Should remember original column
    });

    it('should respect 5-space limit when moving from walkable to water', () => {
      // Test that 5-space limit is enforced when moving into water
      mockMap.width = 20;
      mockMap.height = 5;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2: all grass (walkable)
        if (y === 2) return { name: 'grass' };

        // Row 3: water in middle (columns 3-16), grass only at far edges (0-2 and 17-19)
        if (y === 3) {
          if (x >= 3 && x <= 16) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 10 (middle) - nearest walkable in next row is 7+ spaces away
      mockGameState.cursor = new Cursor(new Position(10, 2));

      // Move down - target position (10,3) is water, but nearest walkable is > 5 spaces away
      movePlayerUseCase.executeSync('down');

                  const result = mockGameState.cursor.position;

      // Should NOT move because nearest walkable positions are more than 5 spaces away
      expect(result.y).toBe(2); // Should stay at original row
      expect(result.x).toBe(10); // Should stay at original column
      expect(mockGameState.cursor.rememberedColumn).toBe(10); // Should remember original column
    });

    it('should favor left side (end of walkable area) when moving into water', () => {
      // Test that cursor goes to the end of walkable area on the left, like Vim's "end of line" behavior
      mockMap.width = 15;
      mockMap.height = 4;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2: all grass (walkable)
        if (y === 2) return { name: 'grass' };

        // Row 3: walkable area from 0-5, water from 6-10, walkable area from 11-14
        // When cursor at column 8 moves down, it should go to column 5 (end of left walkable area)
        if (y === 3) {
          if (x >= 6 && x <= 10) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 8 (which will be water in the next row)
      mockGameState.cursor = new Cursor(new Position(8, 2));

      // Move down - should favor left side (column 5) over right side (column 11)
      movePlayerUseCase.executeSync('down');

            const result = mockGameState.cursor.position;

            // Should go to the end of the left walkable area (column 5), not right side (column 11)
      expect(result.y).toBe(3);
      expect(result.x).toBe(5); // Should favor left side (end of walkable area)
      expect(mockGameState.cursor.rememberedColumn).toBe(8); // Should remember original column
    });

    it('should find end of walkable area on left, not just nearest position', () => {
      // Test the difference between "nearest position" vs "end of walkable area on left"
      mockMap.width = 15;
      mockMap.height = 4;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2: all grass (walkable)
        if (y === 2) return { name: 'grass' };

        // Row 3: Complex pattern to test "end of line" behavior
        // Walkable: 0-3, water: 4-5, walkable: 6-9, water: 10-14
        // When cursor at column 12 moves down, it should go to column 9 (end of left walkable area)
        // NOT column 6 (nearest walkable to the left)
        if (y === 3) {
          if ((x >= 4 && x <= 5) || (x >= 10 && x <= 14)) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 12 (which will be water in the next row)
      mockGameState.cursor = new Cursor(new Position(12, 2));

      // Move down - should go to end of left walkable area (column 9), not nearest (column 6)
      movePlayerUseCase.executeSync('down');

            const result = mockGameState.cursor.position;

            // Should go to the END of the left walkable area (column 9), not just nearest (column 6)
      expect(result.y).toBe(3);
      expect(result.x).toBe(9); // Should be end of walkable area on the left
      expect(mockGameState.cursor.rememberedColumn).toBe(12); // Should remember original column
    });

    it('should always find rightmost walkable position on left side of water, not just nearest', () => {
      // This test ensures we find the END of walkable area, not just nearest position
      mockMap.width = 15;
      mockMap.height = 4;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2: all grass (walkable)
        if (y === 2) return { name: 'grass' };

        // Row 3: Specific pattern to test end-of-line behavior (within 5-space limit)
        // Walkable: 6-7, water: 8, walkable: 9, water: 10-14
        // When cursor at column 10 moves down:
        // - There are two walkable areas within 5 spaces: [6,7] and [9]
        // - The leftmost area is [6,7] and its end is column 7
        // - We want the END of the leftmost walkable area, which is column 7
        if (y === 3) {
          if (x === 8 || (x >= 10 && x <= 14)) return { name: 'water' };
          if ((x >= 6 && x <= 7) || x === 9) return { name: 'grass' };
          return { name: 'water' }; // Everything else is water
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 10 (which will be water in the next row)
      mockGameState.cursor = new Cursor(new Position(10, 2));

      // Move down - if algorithm just finds "nearest", it would go to column 6
      // But we want the END of the left walkable area, which should be column 4
      movePlayerUseCase.executeSync('down');

            const result = mockGameState.cursor.position;

                  // Should go to END of leftmost walkable area (column 7), not just nearest (column 9)
      expect(result.y).toBe(3);
      expect(result.x).toBe(7); // Should be end of leftmost walkable area [6,7]
      expect(mockGameState.cursor.rememberedColumn).toBe(10); // Should remember original column
    });

    it('should use column memory only for water tiles, not other obstacles', () => {
      // Setup a map where water uses column memory but walls do not
      mockMap.width = 15;
      mockMap.height = 8;
      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        if (y === 3) {
          // Row 3: walkable grass area
          return { name: 'grass' };
        }
        if (y === 4) {
          // Row 4: water in the middle, blocking column memory movement
          if (x >= 5 && x <= 9) {
            return { name: 'water' }; // Water - should use column memory
          }
          return { name: 'grass' };
        }
        if (y === 5) {
          // Row 5: wall in the middle, should NOT use column memory
          if (x >= 5 && x <= 9) {
            return { name: 'wall' }; // Wall - should NOT use column memory
          }
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name !== 'water' && tile.name !== 'wall';
      });

            // Test 1: Water should use column memory
      mockGameState.cursor = new Cursor(new Position(7, 3)); // Start at column 7

      // Move down to water area - should use column memory and find nearest walkable
      movePlayerUseCase.executeSync('down');

      // Should use column memory to find walkable position near column 7 (columns 4 or 10 are closest)
      const waterResult = mockGameState.cursor.position;
      expect(waterResult.y).toBe(4); // Should move to row 4
      expect(waterResult.x === 4 || waterResult.x === 10).toBe(true); // Should find nearest walkable (4 or 10)
      expect(mockGameState.cursor.rememberedColumn).toBe(7); // Should remember original column

                  // Test 2: Wall should NOT use column memory - create a clearer test case
      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        if (y === 6) {
          // Row 6: wall at column 7, rest is grass
          if (x === 7) return { name: 'wall' };
          return { name: 'grass' };
        }
        return { name: 'grass' }; // All other positions are grass
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name !== 'wall';
      });

      mockGameState.cursor = new Cursor(new Position(7, 5)); // Start at row 5

      // Try to move down - should hit wall at (7,6) and NOT use column memory search
      movePlayerUseCase.executeSync('down');

      const wallResult = mockGameState.cursor.position;
      // With wall (non-water), should try normal movement to current column
      // Since wall is at (7,6) and we can't walk there, should stay at (7,5)
      expect(wallResult).toEqual(new Position(7, 5)); // Should stay in place (blocked by wall)
      expect(mockGameState.cursor.rememberedColumn).toBe(7); // Column memory still preserved
    });

    it('should distinguish between water and stone obstacles', () => {
      // Setup a map to test water vs stone behavior
      mockMap.width = 10;
      mockMap.height = 6;
      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        if (y === 2) return { name: 'grass' }; // Starting row
        if (y === 3) {
          // Row with water obstacle
          if (x === 5) return { name: 'water' };
          return { name: 'grass' };
        }
        if (y === 4) {
          // Row with stone obstacle
          if (x === 5) return { name: 'stone' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name !== 'water' && tile.name !== 'stone';
      });

      // Start at column 5 (where obstacles will be)
      mockGameState.cursor = new Cursor(new Position(5, 2));

      // Move down to water - should use column memory (stay in place or search within 5 spaces)
      movePlayerUseCase.executeSync('down');

      const afterWater = mockGameState.cursor.position;
      expect(afterWater.y).toBe(3); // Should be able to move to row 3
      expect(afterWater.x).not.toBe(5); // Should avoid the water at column 5
      expect(mockGameState.cursor.rememberedColumn).toBe(5); // Should remember original column

      // Reset and test stone
      mockGameState.cursor = new Cursor(new Position(5, 2));

      // Move down twice to reach stone
      movePlayerUseCase.executeSync('down'); // to row 3
      movePlayerUseCase.executeSync('down'); // to row 4 with stone

      const afterStone = mockGameState.cursor.position;
      // Stone should NOT use column memory - should try normal movement
      expect(afterStone.y).toBe(4); // Should move to row 4
      expect(afterStone.x).not.toBe(5); // Should avoid the stone
      // Column memory behavior may differ since stone doesn't trigger it
    });

    it('should NOT use column memory when walkable areas are disconnected by water', () => {
      // Test scenario from user's images: cursor on left green area tries to move up
      // to disconnected right green area - should not move instead of jumping
      mockMap.width = 15;
      mockMap.height = 6;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2 (current): Left walkable area (0-3), water gap (4-8), right walkable area (9-14)
        if (y === 2) {
          if (x >= 4 && x <= 8) return { name: 'water' };
          return { name: 'grass' };
        }

        // Row 1 (target): Only right walkable area (9-14), water everywhere else (0-8)
        if (y === 1) {
          if (x >= 0 && x <= 8) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 2 on the left walkable area
      mockGameState.cursor = new Cursor(new Position(2, 2));

      // Move up - target position (2,1) is water
      // There IS a walkable area at (9-14,1) but it's disconnected from current position
      // Current implementation incorrectly moves to column 9, but should not move at all
      movePlayerUseCase.executeSync('up');

      const result = mockGameState.cursor.position;

      // Should NOT move because the walkable areas are disconnected
      expect(result.y).toBe(2); // Should stay at original row
      expect(result.x).toBe(2); // Should stay at original column
      expect(mockGameState.cursor.rememberedColumn).toBe(2); // Should remember original column
    });

    it('should use column memory when walkable areas are connected within 5 tiles', () => {
      // Test that column memory works when there's a walkable connection
      mockMap.width = 15;
      mockMap.height = 6;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2 (current): Full walkable row
        if (y === 2) {
          return { name: 'grass' };
        }

        // Row 1 (target): Walkable area (0-5), small water gap (6-7), walkable area (8-14)
        // The gap is only 2 tiles wide, so there's walkable connection within 5 tiles
        if (y === 1) {
          if (x >= 6 && x <= 7) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 6 (will hit water gap when moving up)
      mockGameState.cursor = new Cursor(new Position(6, 2));

      // Move up - should use column memory and go to end of left walkable area (column 5)
      movePlayerUseCase.executeSync('up');

      const result = mockGameState.cursor.position;

      // Should move to end of connected walkable area on the left
      expect(result.y).toBe(1);
      expect(result.x).toBe(5); // End of left walkable area
      expect(mockGameState.cursor.rememberedColumn).toBe(6); // Should remember original column
    });

    it('should reproduce user scenario: incorrectly jumping to disconnected walkable area', () => {
      // This test reproduces the exact issue from the user's images
      // Currently this test will FAIL because the implementation allows jumping to disconnected areas
      mockMap.width = 15;
      mockMap.height = 6;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2 (current): Left walkable area (0-4), water gap (5-9), right walkable area (10-14)
        if (y === 2) {
          if (x >= 5 && x <= 9) return { name: 'water' };
          return { name: 'grass' };
        }

        // Row 1 (target): Mostly water (0-7), right walkable area (8-14)
        // The right area is disconnected from left by 4+ tiles of water
        if (y === 1) {
          if (x >= 0 && x <= 7) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 2 on the left walkable area (like in user's image 1)
      mockGameState.cursor = new Cursor(new Position(2, 2));

      // Move up - target position (2,1) is water
      // Current implementation CORRECTLY doesn't move because areas are disconnected
      movePlayerUseCase.executeSync('up');

      const result = mockGameState.cursor.position;

      // Current implementation (CORRECT): doesn't move because areas are too disconnected
      expect(result.y).toBe(2); // Stays at original row
      expect(result.x).toBe(2); // Stays at original column
      expect(mockGameState.cursor.rememberedColumn).toBe(2); // Should remember original column
    });

    it('should reproduce the specific issue: jumping within 5 tiles to disconnected area', () => {
      // This test now verifies the FIX - cursor should NOT move to disconnected areas
      mockMap.width = 12;
      mockMap.height = 6;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2 (current): Left walkable area (0-3), water gap (4-6), right walkable area (7-11)
        if (y === 2) {
          if (x >= 4 && x <= 6) return { name: 'water' };
          return { name: 'grass' };
        }

        // Row 1 (target): Water (0-4), small walkable area (5-6), water (7-11)
        // Position 5-6 is within 5 tiles of position 2, but disconnected
        if (y === 1) {
          if ((x >= 0 && x <= 4) || (x >= 7 && x <= 11)) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 2 on the left walkable area
      mockGameState.cursor = new Cursor(new Position(2, 2));

      // Move up - target position (2,1) is water
      // There's a walkable area at (5-6,1) which is within 5 tiles, but disconnected
      // With the fix, cursor should NOT move there
      movePlayerUseCase.executeSync('up');

      const result = mockGameState.cursor.position;

      // FIXED BEHAVIOR (CORRECT): Does not jump to disconnected area
      expect(result.y).toBe(2); // Should stay at original row
      expect(result.x).toBe(2); // Should stay at original column
      expect(mockGameState.cursor.rememberedColumn).toBe(2); // Should remember original column
    });

    it('should only use column memory when target area is walkably connected', () => {
      // Test the correct behavior: column memory should only work if you can actually walk
      // from current position to the target area within the search limit
      mockMap.width = 12;
      mockMap.height = 6;

      mockMap.getTileAt.mockImplementation((position) => {
        const { x, y } = position;

        // Row 2 (current): Full walkable row
        if (y === 2) {
          return { name: 'grass' };
        }

        // Row 1 (target): Walkable area (0-2), water gap (3-5), walkable area (6-11)
        // The areas are connected via the full walkable row 2
        if (y === 1) {
          if (x >= 3 && x <= 5) return { name: 'water' };
          return { name: 'grass' };
        }

        return { name: 'grass' };
      });

      mockMap.isWalkable.mockImplementation((position) => {
        const tile = mockMap.getTileAt(position);
        return tile.name === 'grass';
      });

      // Start at column 4 (will hit water gap when moving up)
      mockGameState.cursor = new Cursor(new Position(4, 2));

      // Move up - should use column memory and go to end of left walkable area (column 2)
      // because areas are connected via the bridge in row 2
      movePlayerUseCase.executeSync('up');

      const result = mockGameState.cursor.position;

      // Should move to end of left walkable area in target row (column 2)
      // because areas are walkably connected within 5-tile limit
      expect(result.y).toBe(1);
      expect(result.x).toBe(2); // End of left walkable area
      expect(mockGameState.cursor.rememberedColumn).toBe(4); // Should remember original column
    });
  });
});
