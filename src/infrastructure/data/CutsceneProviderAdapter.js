import { CutsceneProvider } from '../../ports/data/CutsceneProvider.js';
import { OriginStory } from '../../domain/value-objects/OriginStory.js';

/**
 * Infrastructure adapter that provides cutscene configurations
 * Implements the CutsceneProvider port
 */
export class CutsceneProviderAdapter extends CutsceneProvider {
  constructor() {
    super();
    this._originStories = this._initializeOriginStories();
  }

  async getOriginStory(gameId) {
    const story = this._originStories.get(gameId);
    return story || null;
  }

  async hasOriginStory(gameId) {
    return this._originStories.has(gameId);
  }

  async getAllOriginStories() {
    return Array.from(this._originStories.values());
  }

  /**
   * Initialize the available origin stories
   * @private
   */
  _initializeOriginStories() {
    const stories = new Map();

    // Origin Story for "Cursor - Before the Clickers"
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

    stories.set(
      'cursor-before-clickers',
      new OriginStory('cursor-before-clickers', cursorBeforeClickersScript)
    );

    // Future: Add origin stories for other games here
    // Example for cursor-textland could be added later:
    // stories.set('cursor-textland', new OriginStory('cursor-textland', textlandScript));

    return stories;
  }
}
