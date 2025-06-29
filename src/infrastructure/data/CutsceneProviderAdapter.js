import { CutsceneProvider } from '../../ports/data/CutsceneProvider.js';
import { Story } from '../../domain/value-objects/Story.js';

/**
 * Infrastructure adapter that provides cutscene configurations
 * Implements the CutsceneProvider port with support for multi-level cutscenes
 * Integrates with zone system to extract narration as cutscenes
 */
export class CutsceneProviderAdapter extends CutsceneProvider {
  constructor() {
    super();
    this._cutsceneStories = this._initializeCutsceneStories();
  }

  // New multi-level cutscene methods

  async getCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    try {
      // Validate input parameters
      if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
        return null;
      }

      if (!type || !['origin', 'level', 'zone'].includes(type)) {
        return null;
      }

      if (type === 'level' && (!levelId || typeof levelId !== 'string' || !levelId.trim())) {
        return null;
      }

      if (type === 'zone') {
        if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
          return null;
        }
        if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
          return null;
        }
      }

      // Create identifier
      const tempStory = new Story(gameId, type, ['temp'], { levelId, zoneId });
      const identifier = tempStory.identifier;

      // Get story from map
      const story = this._cutsceneStories.get(identifier);
      return story ? story.toJSON() : null;
    } catch (error) {
      return null;
    }
  }

  async hasCutsceneStory(gameId, type, levelId = null, zoneId = null) {
    try {
      // Validate input parameters
      if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
        return false;
      }

      if (!type || !['origin', 'level', 'zone'].includes(type)) {
        return false;
      }

      if (type === 'level' && (!levelId || typeof levelId !== 'string' || !levelId.trim())) {
        return false;
      }

      if (type === 'zone') {
        if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
          return false;
        }
        if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
          return false;
        }
      }

      // Create identifier
      const tempStory = new Story(gameId, type, ['temp'], { levelId, zoneId });
      const identifier = tempStory.identifier;

      return this._cutsceneStories.has(identifier);
    } catch (error) {
      return false;
    }
  }

  async getAllCutsceneStories() {
    return Array.from(this._cutsceneStories.values()).map((story) => story.toJSON());
  }

  async getCutsceneStoriesForGame(gameId) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      return [];
    }

    return Array.from(this._cutsceneStories.values())
      .filter((story) => story.gameId === gameId)
      .map((story) => story.toJSON());
  }

  async getCutsceneStoriesForLevel(gameId, levelId) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      return [];
    }
    if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
      return [];
    }

    return Array.from(this._cutsceneStories.values())
      .filter(
        (story) =>
          story.gameId === gameId &&
          ((story.type === 'level' && story.levelId === levelId) ||
            (story.type === 'zone' && story.levelId === levelId))
      )
      .map((story) => story.toJSON());
  }

  async getCutsceneStoriesForZone(gameId, levelId, zoneId) {
    if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
      return [];
    }
    if (!levelId || typeof levelId !== 'string' || !levelId.trim()) {
      return [];
    }
    if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
      return [];
    }

    return Array.from(this._cutsceneStories.values())
      .filter(
        (story) =>
          story.gameId === gameId &&
          story.levelId === levelId &&
          story.zoneId === zoneId &&
          story.type === 'zone'
      )
      .map((story) => story.toJSON());
  }

  // Legacy methods for backward compatibility

  async getOriginStory(gameId) {
    const gameStory = await this.getCutsceneStory(gameId, 'origin');
    if (!gameStory) {
      return null;
    }

    // Convert back to Story for backward compatibility
    return Story.createOriginStory(gameStory.gameId, gameStory.script);
  }

  async hasOriginStory(gameId) {
    return await this.hasCutsceneStory(gameId, 'origin');
  }

  async getAllOriginStories() {
    const gameStories = Array.from(this._cutsceneStories.values()).filter(
      (story) => story.type === 'origin'
    );

    return gameStories.map((story) => Story.createOriginStory(story.gameId, story.script));
  }

  /**
   * Initialize all cutscene stories (game, level, and zone)
   * @private
   */
  _initializeCutsceneStories() {
    const stories = new Map();

    // Add game-level stories
    this._addGameStories(stories);

    // Add level-level stories
    this._addLevelStories(stories);

    // Add zone-level stories from zone narration
    this._addZoneStories(stories);

    return stories;
  }

  /**
   * Add game-level cutscene stories
   * @private
   */
  _addGameStories(stories) {
    // Game story for "Cursor - Before the Clickers"
    const cursorBeforeClickersScript = [
      '🎵 [Background: soft ambient melody, typewriter clacks echo gently]',
      '',
      '[BLACK SCREEN]',
      '',
      'NARRATOR (calm, magical voice):',
      'Once, the world was clear.',
      'Text flowed like rivers, perfectly aligned.',
      'But the Bugs came.',
      'They chewed through the order,',
      'left commands scrambled,',
      'and the caret spirits lost their voice.',
      '',
      '[FADE IN: a soft blinking dot in a forest clearing—Cursor]',
      '',
      'NARRATOR:',
      'Then, from the Blinking Grove, a spark appeared.',
      'A light not of fire…',
      'but of focus.',
      'You.',
      '',
      '[TEXT APPEARS]',
      '',
      '✨ *Hello, Cursor.*',
      "You don't remember much.",
      'But the land does.',
      'And the land remembers you.',
      '',
      '[Player control begins — movement keys are disabled]',
    ];

    const gameStory = Story.createOriginStory('cursor-before-clickers', cursorBeforeClickersScript);

    stories.set(gameStory.identifier, gameStory);

    // Future: Add game stories for other games here
    // Example for cursor-textland could be added later
  }

  /**
   * Add level-level cutscene stories
   * @private
   */
  _addLevelStories(stories) {
    // Level 2 story - Text Manipulation
    const level2Script = [
      'You have learned the basics of movement.',
      'Now the real challenge begins...',
      '🏛️ Welcome to the realm of Text Manipulation.',
      'Here you will master the sacred modes of VIM:',
      '• Normal Mode - Where you navigate and command',
      '• Insert Mode - Where you create and modify',
      '• Command Mode - Where you wield true power',
      'The Maze of Modes and Swamp of Words await your mastery.',
    ];

    const level2Story = Story.createLevelStory('cursor-before-clickers', 'level_2', level2Script);
    stories.set(level2Story.identifier, level2Story);

    // Level 3 story - Advanced Movement
    const level3Script = [
      '⚡ You have conquered the modes!',
      'But now, the text itself calls to you...',
      'Welcome to Advanced Movement - where every keystroke has purpose.',
      'Delete Canyon will teach you precision in removal.',
      'Field of Insertion will show you the art of placement.',
      'Copy Circle will reveal the mysteries of duplication.',
      'Master these skills, and text will bend to your will.',
    ];

    const level3Story = Story.createLevelStory('cursor-before-clickers', 'level_3', level3Script);
    stories.set(level3Story.identifier, level3Story);

    // Level 4 story - Text Operations
    const level4Script = [
      '🔥 The cursor grows stronger...',
      'Text Operations await - the true power of VIM.',
      'In Search Springs, you will learn to find anything.',
      'In Command Cavern, you will discover the deep magic.',
      'These are not mere tools - they are extensions of thought.',
      'Prepare yourself for mastery beyond movement.',
    ];

    const level4Story = Story.createLevelStory('cursor-before-clickers', 'level_4', level4Script);
    stories.set(level4Story.identifier, level4Story);

    // Level 5 story - Search & Command
    const level5Script = [
      '✨ The final trials await...',
      'You stand at the threshold of true VIM mastery.',
      'Playground of Practice will test everything you know.',
      'Syntax Temple holds the ultimate challenge - the Bug King himself.',
      'This is where legends are made, young Cursor.',
      'The fate of Textland rests in your keystrokes.',
    ];

    const level5Story = Story.createLevelStory('cursor-before-clickers', 'level_5', level5Script);
    stories.set(level5Story.identifier, level5Story);
  }

  /**
   * Add zone-level cutscene stories from zone narration
   * @private
   */
  _addZoneStories(stories) {
    try {
      // Get all zone configurations from the actual zone classes
      const zoneConfigs = this._getZoneConfigurations();

      zoneConfigs.forEach((config) => {
        if (config.narration && Array.isArray(config.narration) && config.narration.length > 0) {
          // Create a zone cutscene story from the zone's narration
          const zoneStory = Story.createZoneStory(
            'cursor-before-clickers', // Default game
            this._getLevelIdForZone(config.zoneId),
            config.zoneId,
            [...config.narration] // Copy the narration array
          );

          stories.set(zoneStory.identifier, zoneStory);
        }
      });
    } catch (error) {
      // If zone system is not available, continue without zone stories
      console.warn('Zone system not available for cutscene integration:', error.message);
    }
  }

  /**
   * Get zone configurations from the actual zone classes
   * @private
   */
  _getZoneConfigurations() {
    try {
      // Import and get configurations from all zone classes
      const zoneConfigs = [];

      // For now, return synchronous configurations to avoid async complexity
      // In a real implementation, you might want to dynamically import zone classes
      // and extract their narration directly from the zone configurations

      // Manually add zone configurations with their narration
      zoneConfigs.push({
        zoneId: 'zone_1',
        narration: [
          'Once, the world was clear. Text flowed like rivers, perfectly aligned. But the Bugs came...',
          'Then, from the Blinking Grove, a spark appeared. A light not of fire… but of focus. You.',
          "✨ *Hello, Cursor.* You don't remember much. But the land does. And the land remembers you.",
          '> Try walking with the keys the wind left behind...',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_2',
        narration: [
          'The stone walls whisper of ancient modes...',
          'Normal mode is where you begin, Insert mode is where you create.',
          'Command mode is where you command the very fabric of text.',
          'Master the transitions, young Cursor, for modes are the keys to power.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_3',
        narration: [
          'The swamp bubbles with words and WORDS...',
          'Here, case matters. Here, boundaries blur.',
          'w moves by word, W moves by WORD.',
          'Learn the difference, or be lost in the linguistic mire.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_4',
        narration: [
          'The canyon echoes with the ghosts of deleted text...',
          'Here you will learn the precision of removal.',
          'dd deletes a line, dw deletes a word.',
          'But remember - with great power comes great responsibility.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_5',
        narration: [
          'Fields of possibility stretch before you...',
          'This is where text comes to life.',
          'i to insert before, a to append after.',
          'I for the beginning, A for the end.',
          'Master insertion, and you master creation itself.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_6',
        narration: [
          'In this circle, nothing is lost, everything is copied...',
          'yy to copy a line, yw to copy a word.',
          'p to paste after, P to paste before.',
          'The circle of text continues, unbroken.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_7',
        narration: [
          'Springs of knowledge bubble with search wisdom...',
          '/ to search forward, ? to search backward.',
          'n for next, N for previous.',
          'Find what you seek, and the text will reveal its secrets.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_8',
        narration: [
          'Deep in the cavern, commands echo with power...',
          ': opens the gateway to command mode.',
          ':w to save, :q to quit, :wq to save and quit.',
          'These are the words that shape reality itself.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_9',
        narration: [
          'This playground tests all you have learned...',
          'Movement, modes, editing, searching, commanding.',
          'Show your mastery here, and prove you are ready.',
          'The final challenge awaits beyond.',
        ],
      });

      zoneConfigs.push({
        zoneId: 'zone_10',
        narration: [
          'The temple trembles with corrupted power...',
          'Here dwells the Bug King, source of all text corruption.',
          'This is the final battle, young Cursor.',
          'Use everything you have learned. Save Textland.',
        ],
      });

      return zoneConfigs;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get level ID for a given zone ID
   * @private
   */
  _getLevelIdForZone(zoneId) {
    // Simple mapping - in a real implementation, this would come from level configurations
    const zoneToLevelMap = {
      zone_1: 'level_1',
      zone_2: 'level_2',
      zone_3: 'level_2',
      zone_4: 'level_3',
      zone_5: 'level_3',
      zone_6: 'level_3',
      zone_7: 'level_4',
      zone_8: 'level_4',
      zone_9: 'level_5',
      zone_10: 'level_5',
    };

    return zoneToLevelMap[zoneId] || 'level_1';
  }
}
