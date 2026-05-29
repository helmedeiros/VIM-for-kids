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
    if (!region) {
      // Procedural fallbacks for decorations whose region isn't
      // registered. Cheap shapes drawn with canvas primitives so a
      // missing tileset cell still renders something recognisable.
      if (decoration.regionName === 'lever_stone') {
        this._drawLeverStone(ctx, decoration, screenX, screenY);
      }
      return;
    }
    const scale = decoration.renderScale ?? 1.0;
    const fullW = decoration.footprintW * this._renderSize;
    const fullH = decoration.footprintH * this._renderSize;
    const drawW = fullW * scale;
    const drawH = fullH * scale;
    // Anchor smaller-than-footprint sprites to the bottom-center of the
    // footprint so a shrunken boulder sits naturally on the floor.
    const dx = screenX + (fullW - drawW) / 2;
    const dy = screenY + (fullH - drawH);
    ctx.drawImage(
      region.image,
      region.sx,
      region.sy,
      region.sw,
      region.sh,
      dx,
      dy,
      drawW,
      drawH
    );
  }

  /**
   * Paint a small stone pedestal with a wooden lever sticking out, used
   * at the south pier next to the labyrinth. Sized to fit the
   * decoration's 1x1 footprint regardless of renderSize.
   * @private
   */
  _drawLeverStone(ctx, decoration, screenX, screenY) {
    const ts = this._renderSize;
    const cx = screenX + ts / 2;
    const baseTop = screenY + Math.floor(ts * 0.45);
    const baseW = Math.floor(ts * 0.7);
    const baseH = Math.floor(ts * 0.45);
    const baseX = cx - baseW / 2;

    // Drop shadow under the base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, baseTop + baseH, baseW * 0.55, baseH * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone base (light cream)
    ctx.fillStyle = '#cdc6b0';
    ctx.fillRect(baseX, baseTop, baseW, baseH);
    // Highlight along the top edge
    ctx.fillStyle = '#e6e0c9';
    ctx.fillRect(baseX, baseTop, baseW, Math.max(1, Math.floor(ts * 0.06)));
    // Darker bottom band
    ctx.fillStyle = '#a39a7d';
    ctx.fillRect(baseX, baseTop + baseH - Math.floor(ts * 0.1), baseW, Math.floor(ts * 0.1));
    // Recessed slot for the lever (dark rectangle in the middle of the top)
    const slotW = Math.floor(baseW * 0.45);
    const slotH = Math.max(2, Math.floor(ts * 0.1));
    ctx.fillStyle = '#3d3a30';
    ctx.fillRect(cx - slotW / 2, baseTop + Math.floor(ts * 0.06), slotW, slotH);

    // Wooden lever — angled stick rising out of the slot
    const leverThickness = Math.max(2, Math.floor(ts * 0.09));
    const leverLength = Math.floor(ts * 0.45);
    ctx.save();
    ctx.translate(cx, baseTop + Math.floor(ts * 0.1));
    ctx.rotate(-0.18); // slight lean to the right
    ctx.fillStyle = '#a0651f';
    ctx.fillRect(-leverThickness / 2, -leverLength, leverThickness, leverLength);
    // Knob at the top of the lever
    ctx.fillStyle = '#c98444';
    ctx.fillRect(-leverThickness, -leverLength - leverThickness, leverThickness * 2, leverThickness);
    ctx.restore();
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
