import { CutsceneProvider } from '../../../src/ports/data/CutsceneProvider.js';

describe('CutsceneProvider', () => {
  let cutsceneProvider;

  beforeEach(() => {
    cutsceneProvider = new CutsceneProvider();
  });

  describe('Constructor', () => {
    it('should create an instance of CutsceneProvider', () => {
      expect(cutsceneProvider).toBeInstanceOf(CutsceneProvider);
    });
  });

  describe('Abstract methods', () => {
    it('should throw error when getOriginStory is called on base class', async () => {
      await expect(cutsceneProvider.getOriginStory('test-game')).rejects.toThrow(
        'CutsceneProvider.getOriginStory must be implemented'
      );
    });

    it('should throw error when hasOriginStory is called on base class', async () => {
      await expect(cutsceneProvider.hasOriginStory('test-game')).rejects.toThrow(
        'CutsceneProvider.hasOriginStory must be implemented'
      );
    });

    it('should throw error when getAllOriginStories is called on base class', async () => {
      await expect(cutsceneProvider.getAllOriginStories()).rejects.toThrow(
        'CutsceneProvider.getAllOriginStories must be implemented'
      );
    });
  });
});
