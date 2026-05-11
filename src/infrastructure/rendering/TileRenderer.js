/**
 * Draws tiles from a sprite sheet onto a Canvas context.
 * Handles sprite lookup via TileAtlas and scaling from sprite size to tile size.
 */
export class TileRenderer {
  constructor(spriteSheet, tileAtlas, renderSize = 32) {
    if (!spriteSheet) {
      throw new Error('TileRenderer requires a SpriteSheet');
    }
    if (!tileAtlas) {
      throw new Error('TileRenderer requires a TileAtlas');
    }

    this._spriteSheet = spriteSheet;
    this._tileAtlas = tileAtlas;
    this._renderSize = renderSize;
  }

  get renderSize() {
    return this._renderSize;
  }

  drawDecoration(ctx, decoration, screenX, screenY) {
    const region = this._tileAtlas.getRegion?.(decoration.regionName);
    if (!region) return;
    ctx.drawImage(
      region.image,
      region.sx,
      region.sy,
      region.sw,
      region.sh,
      screenX,
      screenY,
      decoration.footprintW * this._renderSize,
      decoration.footprintH * this._renderSize
    );
  }

  drawTile(ctx, tileName, screenX, screenY) {
    const region = this._tileAtlas.getRegion?.(tileName);
    if (region) {
      ctx.drawImage(
        region.image,
        region.sx,
        region.sy,
        region.sw,
        region.sh,
        screenX,
        screenY,
        this._renderSize,
        this._renderSize
      );
      return;
    }

    const frameIndex = this._tileAtlas.getFrameIndex(tileName);
    const frame = this._spriteSheet.getFrame(frameIndex);

    ctx.drawImage(
      frame.image,
      frame.sx,
      frame.sy,
      frame.sw,
      frame.sh,
      screenX,
      screenY,
      this._renderSize,
      this._renderSize
    );
  }
}
