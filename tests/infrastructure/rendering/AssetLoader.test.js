import { AssetLoader } from '../../../src/infrastructure/rendering/AssetLoader.js';

describe('AssetLoader', () => {
  let loader;
  let originalImage;

  beforeEach(() => {
    loader = new AssetLoader();

    // Mock Image constructor
    originalImage = global.Image;
    global.Image = class MockImage {
      constructor() {
        this._src = '';
        this.onload = null;
        this.onerror = null;
      }

      get src() {
        return this._src;
      }

      set src(value) {
        this._src = value;
        // Auto-trigger onload in next microtask
        Promise.resolve().then(() => {
          if (this.onload) this.onload();
        });
      }
    };
  });

  afterEach(() => {
    global.Image = originalImage;
  });

  describe('constructor', () => {
    it('initializes as not loaded', () => {
      expect(loader.isLoaded).toBe(false);
    });
  });

  describe('loadImage', () => {
    it('resolves with Image on success', async () => {
      const img = await loader.loadImage('test.png');
      expect(img).toBeDefined();
      expect(img.src).toBe('test.png');
    });

    it('rejects on error', async () => {
      global.Image = class FailImage {
        constructor() {
          this._src = '';
          this.onload = null;
          this.onerror = null;
        }

        get src() {
          return this._src;
        }

        set src(value) {
          this._src = value;
          Promise.resolve().then(() => {
            if (this.onerror) this.onerror();
          });
        }
      };

      await expect(loader.loadImage('bad.png')).rejects.toThrow('Failed to load image: bad.png');
    });
  });

  describe('loadAll', () => {
    it('loads all assets from manifest', async () => {
      await loader.loadAll({
        tileset: 'tileset.png',
        characters: 'characters.png',
      });

      expect(loader.isLoaded).toBe(true);
      expect(loader.getAsset('tileset')).not.toBeNull();
      expect(loader.getAsset('characters')).not.toBeNull();
    });

    it('sets isLoaded to true after completion', async () => {
      await loader.loadAll({ test: 'test.png' });
      expect(loader.isLoaded).toBe(true);
    });
  });

  describe('getAsset', () => {
    it('returns null for unknown asset', () => {
      expect(loader.getAsset('nonexistent')).toBeNull();
    });

    it('returns loaded asset by name', async () => {
      await loader.loadAll({ myAsset: 'my.png' });
      const asset = loader.getAsset('myAsset');
      expect(asset).not.toBeNull();
      expect(asset.src).toBe('my.png');
    });
  });
});
