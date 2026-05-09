/**
 * Promise-based asset loader for images and other resources.
 * Loads assets in parallel and provides named access once loaded.
 */
export class AssetLoader {
  constructor() {
    this._assets = new Map();
    this._loaded = false;
  }

  get isLoaded() {
    return this._loaded;
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  async loadAll(manifest) {
    const entries = Object.entries(manifest);
    const results = await Promise.all(
      entries.map(async ([name, url]) => {
        const asset = await this.loadImage(url);
        return [name, asset];
      })
    );

    for (const [name, asset] of results) {
      this._assets.set(name, asset);
    }

    this._loaded = true;
  }

  getAsset(name) {
    return this._assets.get(name) || null;
  }
}
