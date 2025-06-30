import { DialogueService } from '../../../src/application/services/DialogueService.js';
import { CaretStone } from '../../../src/domain/entities/CaretStone.js';
import { MazeScribe } from '../../../src/domain/entities/MazeScribe.js';
import { DeletionEcho } from '../../../src/domain/entities/DeletionEcho.js';
import { InsertScribe } from '../../../src/domain/entities/InsertScribe.js';
import { MirrorSprite } from '../../../src/domain/entities/MirrorSprite.js';
import { PracticeBuddy } from '../../../src/domain/entities/PracticeBuddy.js';

describe('DialogueService', () => {
  let dialogueService;
  let mockGameState;

  beforeEach(() => {
    dialogueService = new DialogueService();
    mockGameState = {
      collectedKeys: new Set(['h', 'j', 'k', 'l']),
      currentZone: 'zone_1',
    };
  });

  describe('Constructor', () => {
    test('should initialize with empty state', () => {
      expect(dialogueService.currentDialogue).toBeNull();
      expect(dialogueService.conversationHistory.size).toBe(0);
      expect(dialogueService.teachingMoments.size).toBe(0);
      expect(dialogueService.encouragementTimers.size).toBe(0);
    });
  });

  describe('getNPCDialogue', () => {
    test('should return empty array for null NPC', () => {
      const dialogue = dialogueService.getNPCDialogue(null);
      expect(dialogue).toEqual([]);
    });

    test('should use NPC getDialogue method if available', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      const dialogue = dialogueService.getNPCDialogue(caretStone, mockGameState);

      expect(Array.isArray(dialogue)).toBe(true);
      expect(dialogue.length).toBeGreaterThan(0);
      // Should use CaretStone's contextual dialogue
      expect(
        dialogue.some(
          (line) =>
            line.includes('foundation') || line.includes('ancient') || line.includes('stone')
        )
      ).toBe(true);
    });

    test('should use zone-configured dialogue as fallback', () => {
      const mockNPC = {
        id: 'test_npc',
        dialogue: ['Hello, traveler!', 'Welcome to our realm.'],
      };

      const dialogue = dialogueService.getNPCDialogue(mockNPC, mockGameState);
      expect(dialogue).toEqual(['Hello, traveler!', 'Welcome to our realm.']);
    });

    test('should use default dialogue for unknown NPC', () => {
      const mockNPC = { id: 'unknown_npc', type: 'generic' };
      const dialogue = dialogueService.getNPCDialogue(mockNPC, mockGameState);

      expect(dialogue).toEqual([
        'Hello, traveler.',
        'May your journey through VIM be enlightening.',
      ]);
    });

    test('should use type-specific default dialogue', () => {
      const mockNPC = { id: 'test_spirit', type: 'caret_spirit' };
      const dialogue = dialogueService.getNPCDialogue(mockNPC, mockGameState);

      expect(dialogue).toEqual([
        'Welcome, young cursor.',
        'The four directions await your mastery.',
        'Practice hjkl until they become instinct.',
      ]);
    });
  });

  describe('getTeachingMoment', () => {
    test('should return teaching dialogue for CaretStone movement', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      const teaching = dialogueService.getTeachingMoment(caretStone, 'h');

      expect(teaching).toBeTruthy();
      expect(teaching).toContain('left');
      expect(teaching.includes('setting sun') || teaching.includes('...')).toBe(true);
    });

    test('should return teaching dialogue for MazeScribe modes', () => {
      const mazeScribe = new MazeScribe('maze_scribe_1', [20, 20]);
      const teaching = dialogueService.getTeachingMoment(mazeScribe, 'i');

      expect(teaching).toBeTruthy();
      expect(teaching).toContain('INSERT');
      expect(teaching).toContain('awakens');
    });

    test('should return teaching dialogue for DeletionEcho commands', () => {
      const deletionEcho = new DeletionEcho('deletion_echo_1', [15, 15]);
      const teaching = dialogueService.getTeachingMoment(deletionEcho, 'x');

      expect(teaching).toBeTruthy();
      expect(teaching).toContain('character');
      expect(teaching.includes('flickers') || teaching.includes('precise')).toBe(true);
    });

    test('should return teaching dialogue for InsertScribe insertions', () => {
      const insertScribe = new InsertScribe('insert_scribe_1', [25, 25]);
      const teaching = dialogueService.getTeachingMoment(insertScribe, 'i');

      expect(teaching).toBeTruthy();
      expect(teaching).toContain('INSERT');
      expect(teaching.includes('Quill') || teaching.includes('creation')).toBe(true);
    });

    test('should return teaching dialogue for MirrorSprite search', () => {
      const mirrorSprite = new MirrorSprite('mirror_sprite_1', [30, 30]);
      const teaching = dialogueService.getTeachingMoment(mirrorSprite, '/');

      expect(teaching).toBeTruthy();
      expect(teaching.includes('slash') || teaching.includes('forward')).toBe(true);
      expect(teaching.includes('Shimmers') || teaching.includes('tomorrow')).toBe(true);
    });

    test('should return celebration for PracticeBuddy skills', () => {
      const practiceBuddy = new PracticeBuddy('practice_buddy_1', [35, 35]);
      const celebration = dialogueService.getTeachingMoment(practiceBuddy, 'h');

      expect(celebration).toBeTruthy();
      expect(celebration).toContain('Left movement');
      expect(celebration).toContain('🎉');
    });

    test('should use generic teaching for unknown skills', () => {
      const mockNPC = { id: 'generic_npc', type: 'generic' };
      const teaching = dialogueService.getTeachingMoment(mockNPC, 'unknown_skill');

      expect(teaching).toContain('unknown_skill');
      expect(teaching).toContain('Keep practicing');
    });

    test('should implement cooldown for repeated teaching', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);

      // First teaching should work
      const firstTeaching = dialogueService.getTeachingMoment(caretStone, 'h');
      expect(firstTeaching).toBeTruthy();

      // Immediate second teaching should be null (cooldown)
      const secondTeaching = dialogueService.getTeachingMoment(caretStone, 'h');
      expect(secondTeaching).toBeNull();
    });
  });

  describe('getEncouragement', () => {
    test('should return empty string for null NPC', () => {
      const encouragement = dialogueService.getEncouragement(null);
      expect(encouragement).toBe('');
    });

    test('should get motivational support from PracticeBuddy', () => {
      const practiceBuddy = new PracticeBuddy('practice_buddy_1', [10, 10]);
      const encouragement = dialogueService.getEncouragement(practiceBuddy, 'movement');

      expect(encouragement).toBeTruthy();
      expect(encouragement).toContain('Movement');
      expect(encouragement.includes('🏃‍♂️') || encouragement.includes('hjkl')).toBe(true);
    });

    test('should get general encouragement from PracticeBuddy', () => {
      const practiceBuddy = new PracticeBuddy('practice_buddy_1', [10, 10]);
      const encouragement = dialogueService.getEncouragement(practiceBuddy);

      expect(encouragement).toBeTruthy();
      expect(typeof encouragement).toBe('string');
      expect(encouragement.length).toBeGreaterThan(0);
    });

    test('should get encouragement from other NPCs', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      const encouragement = dialogueService.getEncouragement(caretStone);

      expect(encouragement).toBeTruthy();
      expect(typeof encouragement).toBe('string');
    });

    test('should return generic encouragement for NPCs without encouragement method', () => {
      const mockNPC = { id: 'generic_npc', type: 'generic' };
      const encouragement = dialogueService.getEncouragement(mockNPC);

      expect(encouragement).toBeTruthy();
      expect(
        encouragement.includes('practicing') ||
          encouragement.includes('progress') ||
          encouragement.includes('VIM') ||
          encouragement.includes('expertise') ||
          encouragement.includes('muscle') ||
          encouragement.includes('keystroke')
      ).toBe(true);
    });
  });

  describe('celebrateMilestone', () => {
    test('should celebrate with PracticeBuddy as primary celebrant', () => {
      const practiceBuddy = new PracticeBuddy('practice_buddy_1', [10, 10]);
      const celebration = dialogueService.celebrateMilestone('basic_movement', [practiceBuddy]);

      expect(celebration).toBeTruthy();
      expect(celebration.npc).toBe(practiceBuddy);
      expect(celebration.type).toBe('celebration');
      expect(celebration.dialogue).toContain('MOVEMENT');
      expect(celebration.dialogue).toContain('🚀');
    });

    test('should find appropriate NPC for milestone when no PracticeBuddy', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      const celebration = dialogueService.celebrateMilestone('basic_movement', [caretStone]);

      expect(celebration).toBeTruthy();
      expect(celebration.npc).toBe(caretStone);
      expect(celebration.dialogue).toContain('Ancient paths');
    });

    test('should return null when no appropriate NPC available', () => {
      const celebration = dialogueService.celebrateMilestone('unknown_milestone', []);
      expect(celebration).toBeNull();
    });
  });

  describe('Conversation Management', () => {
    test('should start conversation with NPC', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      const conversation = dialogueService.startConversation(caretStone, mockGameState);

      expect(conversation).toBeTruthy();
      expect(conversation.npc).toBe(caretStone);
      expect(conversation.currentLine).toBe(0);
      expect(conversation.isActive).toBe(true);
      expect(Array.isArray(conversation.dialogue)).toBe(true);
      expect(dialogueService.currentDialogue).toBe(conversation);
    });

    test('should advance conversation to next line', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      dialogueService.startConversation(caretStone, mockGameState);

      const nextLine = dialogueService.advanceConversation();
      expect(nextLine).toBeTruthy();
      expect(nextLine.line).toBe(1);
      expect(typeof nextLine.text).toBe('string');
      expect(nextLine.total).toBeGreaterThan(0);
    });

    test('should end conversation when dialogue finished', () => {
      const mockNPC = {
        id: 'short_npc',
        dialogue: ['Hello!'],
      };

      dialogueService.startConversation(mockNPC, mockGameState);

      // Try to advance past the single line
      const result = dialogueService.advanceConversation();
      expect(result).toBeNull();
      expect(dialogueService.currentDialogue).toBeNull();
    });

    test('should get conversation progress', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      dialogueService.startConversation(caretStone, mockGameState);

      const progress = dialogueService.getConversationProgress();
      expect(progress).toBeTruthy();
      expect(progress.npc).toBe(caretStone);
      expect(progress.progress).toBe(1);
      expect(typeof progress.currentText).toBe('string');
      expect(progress.isFinished).toBeDefined();
    });

    test('should end conversation manually', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      dialogueService.startConversation(caretStone, mockGameState);

      expect(dialogueService.currentDialogue).toBeTruthy();

      dialogueService.endConversation();
      expect(dialogueService.currentDialogue).toBeNull();
    });

    test('should return null progress when no active conversation', () => {
      const progress = dialogueService.getConversationProgress();
      expect(progress).toBeNull();
    });
  });

  describe('Conversation History', () => {
    test('should track conversation history', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      dialogueService.startConversation(caretStone, mockGameState);

      expect(dialogueService.conversationHistory.has('caret_stone_1')).toBe(true);
      const history = dialogueService.conversationHistory.get('caret_stone_1');
      expect(history.length).toBe(1);
    });

    test('should check recent conversations', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);
      dialogueService.startConversation(caretStone, mockGameState);

      // Should have recent conversation
      const hasRecent = dialogueService.hasRecentConversation('caret_stone_1', 60000);
      expect(hasRecent).toBe(true);

      // Should not have recent conversation for different NPC
      const hasRecentOther = dialogueService.hasRecentConversation('other_npc', 60000);
      expect(hasRecentOther).toBe(false);
    });

    test('should limit conversation history to 5 entries', () => {
      const caretStone = new CaretStone('caret_stone_1', [10, 10]);

      // Start 6 conversations
      for (let i = 0; i < 6; i++) {
        dialogueService.startConversation(caretStone, mockGameState);
        dialogueService.endConversation();
      }

      const history = dialogueService.conversationHistory.get('caret_stone_1');
      expect(history.length).toBe(5);
    });
  });

  describe('NPC Integration', () => {
    test('should handle all new NPC types correctly', () => {
      const npcs = [
        new CaretStone('caret_stone', [0, 0]),
        new MazeScribe('maze_scribe', [0, 0]),
        new DeletionEcho('deletion_echo', [0, 0]),
        new InsertScribe('insert_scribe', [0, 0]),
        new MirrorSprite('mirror_sprite', [0, 0]),
        new PracticeBuddy('practice_buddy', [0, 0]),
      ];

      npcs.forEach((npc) => {
        const dialogue = dialogueService.getNPCDialogue(npc, mockGameState);
        expect(Array.isArray(dialogue)).toBe(true);
        expect(dialogue.length).toBeGreaterThan(0);

        const conversation = dialogueService.startConversation(npc, mockGameState);
        expect(conversation).toBeTruthy();
        expect(conversation.npc).toBe(npc);

        dialogueService.endConversation();
      });
    });
  });
});
