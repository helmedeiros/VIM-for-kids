/**
 * Handles per-tile-type animations by cycling through sprite frame offsets.
 * Water and field tiles get subtle animation; static tiles return fixed frames.
 */
export class AnimatedTile {
  constructor() {
    this._animations = {
      water: { frameCount: 3, interval: 0.6, baseOffset: 0 },
      field: { frameCount: 2, interval: 1.0, baseOffset: 0 },
    };
  }

  isAnimated(tileName) {
    return tileName in this._animations;
  }

  getFrameOffset(tileName, time) {
    const anim = this._animations[tileName];
    if (!anim) return 0;

    const frameIndex = Math.floor(time / anim.interval) % anim.frameCount;
    return frameIndex;
  }

  getAnimatedTileNames() {
    return Object.keys(this._animations);
  }
}
