import { NPCInteractionUseCase } from '../../../src/application/use-cases/NPCInteractionUseCase.js';
import { Position } from '../../../src/domain/value-objects/Position.js';

describe('NPCInteractionUseCase', () => {
  let npcInteractionUseCase;
  let mockGameRenderer;
  let mockDialogueService;
  let mockGameState;

  beforeEach(() => {
    mockGameRenderer = {
      showNPCDialogue: jest.fn(),
      showMessage: jest.fn(),
    };

    mockDialogueService = {
      getNPCDialogue: jest.fn(),
      getTeachingMoment: jest.fn(),
      celebrateMilestone: jest.fn(),
    };

    mockGameState = {
      npcs: [],
      cursor: { position: new Position(5, 5) },
      collectedKeys: new Set(['h', 'j']),
    };

    npcInteractionUseCase = new NPCInteractionUseCase(mockGameRenderer, mockDialogueService);
  });

  describe('execute', () => {
    it('should return no interaction when no NPCs are present', () => {
      mockGameState.npcs = [];
      const position = new Position(5, 5);

      const result = npcInteractionUseCase.execute(position, mockGameState);

      expect(result).toEqual({
        interactionOccurred: false,
        npc: null,
      });
    });

    it('should return no interaction when NPCs array is null', () => {
      mockGameState.npcs = null;
      const position = new Position(5, 5);

      const result = npcInteractionUseCase.execute(position, mockGameState);

      expect(result).toEqual({
        interactionOccurred: false,
        npc: null,
      });
    });

    it('should return no interaction when no NPC at position', () => {
      mockGameState.npcs = [
        { id: 'npc1', position: [10, 10], dialogue: ['Hello'] },
        { id: 'npc2', position: [15, 15], dialogue: ['Hi'] },
      ];
      const position = new Position(5, 5);

      const result = npcInteractionUseCase.execute(position, mockGameState);

      expect(result).toEqual({
        interactionOccurred: false,
        npc: null,
      });
    });

    it('should detect NPC at position and trigger dialogue', () => {
      // Create use case without DialogueService to test direct NPC dialogue
      const testUseCase = new NPCInteractionUseCase(mockGameRenderer);
      const mockNPC = {
        id: 'test_npc',
        name: 'Test NPC',
        position: [5, 5],
        dialogue: ['Hello!', 'Welcome!'],
      };
      mockGameState.npcs = [mockNPC];
      const position = new Position(5, 5);

      const result = testUseCase.execute(position, mockGameState);

      expect(result.interactionOccurred).toBe(true);
      expect(result.npc).toBe(mockNPC);
      expect(result.dialogue).toEqual(['Hello!', 'Welcome!']);
      expect(mockGameRenderer.showNPCDialogue).toHaveBeenCalledWith(
        mockNPC,
        ['Hello!', 'Welcome!'],
        { duration: 6000 }
      );
    });

    it('should handle NPC with getDialogue method', () => {
      // Create use case without DialogueService to test NPC's getDialogue method
      const testUseCase = new NPCInteractionUseCase(mockGameRenderer);
      const mockNPC = {
        id: 'dynamic_npc',
        position: [5, 5],
        getDialogue: jest.fn().mockReturnValue(['Dynamic hello!', 'Contextual message!']),
      };
      mockGameState.npcs = [mockNPC];
      const position = new Position(5, 5);

      const result = testUseCase.execute(position, mockGameState);

      expect(result.interactionOccurred).toBe(true);
      expect(mockNPC.getDialogue).toHaveBeenCalledWith(mockGameState);
      expect(result.dialogue).toEqual(['Dynamic hello!', 'Contextual message!']);
    });

    it('should use DialogueService when available', () => {
      const mockNPC = { id: 'service_npc', position: [5, 5] };
      mockGameState.npcs = [mockNPC];
      mockDialogueService.getNPCDialogue.mockReturnValue(['Service dialogue!']);
      const position = new Position(5, 5);

      const result = npcInteractionUseCase.execute(position, mockGameState);

      expect(mockDialogueService.getNPCDialogue).toHaveBeenCalledWith(mockNPC, mockGameState);
      expect(result.dialogue).toEqual(['Service dialogue!']);
    });

    it('should fallback to default dialogue when NPC has no dialogue', () => {
      // Create use case without DialogueService to test fallback dialogue
      const testUseCase = new NPCInteractionUseCase(mockGameRenderer);
      const mockNPC = { id: 'empty_npc', position: [5, 5] };
      mockGameState.npcs = [mockNPC];
      const position = new Position(5, 5);

      const result = testUseCase.execute(position, mockGameState);

      expect(result.dialogue).toEqual(['Hello, traveler!', 'Welcome to this realm.']);
    });

    it('should handle NPCs with malformed position data', () => {
      mockGameState.npcs = [
        { id: 'npc1', position: null },
        { id: 'npc2', position: 'invalid' },
        { id: 'npc3', position: [5] }, // Only one coordinate
        { id: 'npc4', position: [5, 5] }, // Valid position
      ];
      const position = new Position(5, 5);

      const result = npcInteractionUseCase.execute(position, mockGameState);

      expect(result.interactionOccurred).toBe(true);
      expect(result.npc.id).toBe('npc4');
    });
  });

  describe('_findNPCAtPosition', () => {
    it('should find NPC at exact position', () => {
      const npcs = [
        { id: 'npc1', position: [3, 4] },
        { id: 'npc2', position: [5, 5] },
        { id: 'npc3', position: [7, 8] },
      ];
      const position = new Position(5, 5);

      const result = npcInteractionUseCase._findNPCAtPosition(position, npcs);

      expect(result).toBe(npcs[1]);
    });

    it('should return null when no NPC at position', () => {
      const npcs = [
        { id: 'npc1', position: [3, 4] },
        { id: 'npc2', position: [7, 8] },
      ];
      const position = new Position(5, 5);

      const result = npcInteractionUseCase._findNPCAtPosition(position, npcs);

      expect(result).toBeUndefined();
    });
  });

  describe('_getNPCDialogue', () => {
    it('should prioritize DialogueService over NPC methods', () => {
      const mockNPC = {
        getDialogue: jest.fn().mockReturnValue(['NPC method']),
        dialogue: ['Zone dialogue'],
      };
      mockDialogueService.getNPCDialogue.mockReturnValue(['Service dialogue']);

      const result = npcInteractionUseCase._getNPCDialogue(mockNPC, mockGameState);

      expect(result).toEqual(['Service dialogue']);
      expect(mockDialogueService.getNPCDialogue).toHaveBeenCalledWith(mockNPC, mockGameState);
      expect(mockNPC.getDialogue).not.toHaveBeenCalled();
    });

    it('should use NPC getDialogue method when DialogueService unavailable', () => {
      npcInteractionUseCase = new NPCInteractionUseCase(mockGameRenderer); // No DialogueService
      const mockNPC = {
        getDialogue: jest.fn().mockReturnValue(['NPC method dialogue']),
        dialogue: ['Zone dialogue'],
      };

      const result = npcInteractionUseCase._getNPCDialogue(mockNPC, mockGameState);

      expect(result).toEqual(['NPC method dialogue']);
      expect(mockNPC.getDialogue).toHaveBeenCalledWith(mockGameState);
    });

    it('should use zone dialogue when no other methods available', () => {
      npcInteractionUseCase = new NPCInteractionUseCase(mockGameRenderer); // No DialogueService
      const mockNPC = { dialogue: ['Zone dialogue only'] };

      const result = npcInteractionUseCase._getNPCDialogue(mockNPC, mockGameState);

      expect(result).toEqual(['Zone dialogue only']);
    });

    it('should use fallback dialogue when no dialogue available', () => {
      npcInteractionUseCase = new NPCInteractionUseCase(mockGameRenderer); // No DialogueService
      const mockNPC = { id: 'empty_npc' };

      const result = npcInteractionUseCase._getNPCDialogue(mockNPC, mockGameState);

      expect(result).toEqual(['Hello, traveler!', 'Welcome to this realm.']);
    });
  });

  describe('_displayNPCDialogue', () => {
    it('should use showNPCDialogue when available', () => {
      // Create use case without DialogueService to test direct NPC dialogue
      const testUseCase = new NPCInteractionUseCase(mockGameRenderer);
      const mockNPC = { dialogue: ['Test dialogue'] };

      testUseCase._displayNPCDialogue(mockNPC, mockGameState);

      expect(mockGameRenderer.showNPCDialogue).toHaveBeenCalledWith(mockNPC, ['Test dialogue'], {
        duration: 6000,
      });
    });

    it('should fallback to showMessage when showNPCDialogue unavailable', () => {
      const testRenderer = {
        showMessage: jest.fn(),
        // showNPCDialogue is undefined
      };
      const testUseCase = new NPCInteractionUseCase(testRenderer);
      const mockNPC = { id: 'test_npc', name: 'Test NPC', dialogue: ['Hello', 'World'] };

      testUseCase._displayNPCDialogue(mockNPC, mockGameState);

      expect(testRenderer.showMessage).toHaveBeenCalledWith('Hello\n\nWorld', {
        type: 'dialogue',
        speaker: 'Test NPC',
        duration: 6000,
      });
    });

    it('should use NPC ID as speaker when name unavailable', () => {
      const testRenderer = {
        showMessage: jest.fn(),
        // showNPCDialogue is undefined
      };
      const testUseCase = new NPCInteractionUseCase(testRenderer);
      const mockNPC = { id: 'speaker_npc', dialogue: ['Message'] };

      testUseCase._displayNPCDialogue(mockNPC, mockGameState);

      expect(testRenderer.showMessage).toHaveBeenCalledWith('Message', {
        type: 'dialogue',
        speaker: 'speaker_npc',
        duration: 6000,
      });
    });
  });

  describe('handleTeachingMoment', () => {
    it('should delegate to DialogueService when available', () => {
      const mockNPC = { id: 'teacher_npc' };
      const skill = 'movement';
      mockDialogueService.getTeachingMoment.mockReturnValue('Great movement!');

      const result = npcInteractionUseCase.handleTeachingMoment(mockNPC, skill, mockGameState);

      expect(mockDialogueService.getTeachingMoment).toHaveBeenCalledWith(mockNPC, skill);
      expect(result).toBe('Great movement!');
    });

    it('should return null when DialogueService unavailable', () => {
      npcInteractionUseCase = new NPCInteractionUseCase(mockGameRenderer); // No DialogueService
      const mockNPC = { id: 'teacher_npc' };

      const result = npcInteractionUseCase.handleTeachingMoment(mockNPC, 'skill', mockGameState);

      expect(result).toBeNull();
    });
  });

  describe('handleMilestoneCelebration', () => {
    it('should delegate to DialogueService when available', () => {
      const milestone = 'first_zone_complete';
      const npcs = [{ id: 'celebration_npc' }];
      const celebrationData = { npc: npcs[0], dialogue: ['Congratulations!'] };
      mockDialogueService.celebrateMilestone.mockReturnValue(celebrationData);

      const result = npcInteractionUseCase.handleMilestoneCelebration(
        milestone,
        npcs,
        mockGameState
      );

      expect(mockDialogueService.celebrateMilestone).toHaveBeenCalledWith(milestone, npcs);
      expect(result).toBe(celebrationData);
    });

    it('should return null when DialogueService unavailable', () => {
      npcInteractionUseCase = new NPCInteractionUseCase(mockGameRenderer); // No DialogueService
      const milestone = 'test_milestone';
      const npcs = [];

      const result = npcInteractionUseCase.handleMilestoneCelebration(
        milestone,
        npcs,
        mockGameState
      );

      expect(result).toBeNull();
    });
  });

  describe('constructor', () => {
    it('should work without DialogueService', () => {
      const useCase = new NPCInteractionUseCase(mockGameRenderer);

      expect(useCase._gameRenderer).toBe(mockGameRenderer);
      expect(useCase._dialogueService).toBeNull();
    });

    it('should store DialogueService when provided', () => {
      const useCase = new NPCInteractionUseCase(mockGameRenderer, mockDialogueService);

      expect(useCase._gameRenderer).toBe(mockGameRenderer);
      expect(useCase._dialogueService).toBe(mockDialogueService);
    });
  });
});
