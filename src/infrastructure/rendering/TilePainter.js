/**
 * Paints high-quality tiles at runtime using Canvas 2D API.
 * Each tile is painted once onto an offscreen canvas and cached.
 *
 * Visual style: GBA-era RPG aesthetic (Pokemon/Zelda) with
 * dark outlines, 3-4 shade depth, consistent top-left lighting,
 * and clear silhouettes that create a 2D-that-looks-3D effect.
 */
export class TilePainter {
  constructor(tileSize = 32, columns = 29) {
    this._ts = tileSize;
    this._columns = columns;
  }

  createTilesetCanvas() {
    const ts = this._ts;
    const canvas = document.createElement('canvas');
    canvas.width = this._columns * ts;
    canvas.height = ts;
    const ctx = canvas.getContext('2d');

    const painters = [
      (c) => this._paintWater(c),
      (c) => this._paintGrass(c),
      (c) => this._paintDirt(c),
      (c) => this._paintTree(c),
      (c) => this._paintStone(c),
      (c) => this._paintPath(c),
      (c) => this._paintWall(c),
      (c) => this._paintBridge(c),
      (c) => this._paintSand(c),
      (c) => this._paintRuins(c),
      (c) => this._paintField(c),
      (c) => this._paintTestGround(c),
      (c) => this._paintBossArea(c),
      (c) => this._paintRampRight(c),
      (c) => this._paintRampLeft(c),
      (c) => this._paintVoid(c),
      (c) => this._paintRock(c),
      (c) => this._paintWallMid(c),
      (c) => this._paintWallCap(c),
      (c) => this._paintCliffN(c),
      (c) => this._paintGrassEdgeN(c),
      (c) => this._paintGrassEdgeE(c),
      (c) => this._paintGrassEdgeS(c),
      (c) => this._paintGrassEdgeW(c),
      (c) => this._paintCobblestone(c),
      (c) => this._paintFlowerCluster(c),
      (c) => this._paintMushroom(c),
      (c) => this._paintTallGrass(c),
      (c) => this._paintTreasureChest(c),
    ];

    painters.forEach((paint, i) => {
      const tc = document.createElement('canvas');
      tc.width = ts;
      tc.height = ts;
      paint(tc.getContext('2d'));
      ctx.drawImage(tc, i * ts, 0);
    });

    return canvas;
  }

  createCharacterCanvas() {
    const ts = this._ts;
    const cols = 12;
    const rows = 2;
    const canvas = document.createElement('canvas');
    canvas.width = cols * ts;
    canvas.height = rows * ts;
    const ctx = canvas.getContext('2d');

    // Indices must match CharacterSprites:
    //   0-7  : cursor (s/n/e/w × idle/step)
    //   8-10 : vim_key, collectible_key, gate_open
    //   11   : gate_closed
    //   12-20: NPCs (existing)
    //   21   : pixel_snake (level-2 boss)
    const painters = [
      (c) => this._paintCursor(c, 's', 0),
      (c) => this._paintCursor(c, 's', 1),
      (c) => this._paintCursor(c, 'n', 0),
      (c) => this._paintCursor(c, 'n', 1),
      (c) => this._paintCursor(c, 'e', 0),
      (c) => this._paintCursor(c, 'e', 1),
      (c) => this._paintCursor(c, 'w', 0),
      (c) => this._paintCursor(c, 'w', 1),
      (c) => this._paintVimKey(c),
      (c) => this._paintCollectibleKey(c),
      (c) => this._paintGateOpen(c),
      (c) => this._paintGateClosed(c),
      (c) => this._paintCaretSpirit(c),
      (c) => this._paintSyntaxWisp(c),
      (c) => this._paintBugKing(c),
      (c) => this._paintCaretStone(c),
      (c) => this._paintMazeScribe(c),
      (c) => this._paintDeletionEcho(c),
      (c) => this._paintInsertScribe(c),
      (c) => this._paintPracticeBuddy(c),
      (c) => this._paintMirrorSprite(c),
      (c) => this._paintPixelSnake(c),
    ];

    painters.forEach((paint, i) => {
      if (!paint) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tc = document.createElement('canvas');
      tc.width = ts;
      tc.height = ts;
      paint(tc.getContext('2d'));
      ctx.drawImage(tc, col * ts, row * ts);
    });

    return canvas;
  }

  // ========== HELPERS ==========

  _outline(ctx, x, y, w, h, color = '#1a1a2e') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  _sphere(ctx, cx, cy, r, baseColor, highlightColor, shadowColor) {
    // Shadow
    const shadow = ctx.createRadialGradient(cx + r * 0.2, cy + r * 0.2, r * 0.1, cx, cy, r);
    shadow.addColorStop(0, highlightColor);
    shadow.addColorStop(0.5, baseColor);
    shadow.addColorStop(1, shadowColor);
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== TILE PAINTERS ==========

  _paintWater(ctx) {
    const ts = this._ts;

    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#4888b8');
    bg.addColorStop(0.5, '#3878a0');
    bg.addColorStop(1, '#5090c0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);

    // Diagonal hatch
    ctx.strokeStyle = 'rgba(80, 140, 190, 0.5)';
    ctx.lineWidth = 1;
    for (let i = -ts; i < ts * 2; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + ts, ts);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(50, 100, 150, 0.25)';
    for (let i = -ts; i < ts * 2; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i + ts, 0);
      ctx.lineTo(i, ts);
      ctx.stroke();
    }

    // Wave highlights
    ctx.strokeStyle = 'rgba(130, 190, 230, 0.45)';
    ctx.lineWidth = 1.5;
    for (const yBase of [9, 22]) {
      ctx.beginPath();
      for (let x = 0; x < ts; x++) {
        const y = yBase + Math.sin(x * 0.35) * 2;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  _paintGrass(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#58a848';
    ctx.fillRect(0, 0, ts, ts);

    // Subtle checkerboard depth
    ctx.fillStyle = 'rgba(75, 180, 65, 0.25)';
    ctx.fillRect(0, 0, ts / 2, ts / 2);
    ctx.fillRect(ts / 2, ts / 2, ts / 2, ts / 2);
    ctx.fillStyle = 'rgba(60, 145, 50, 0.2)';
    ctx.fillRect(ts / 2, 0, ts / 2, ts / 2);
    ctx.fillRect(0, ts / 2, ts / 2, ts / 2);

    // Blade clusters (light tips)
    ctx.fillStyle = '#70c860';
    const blades = [[3, 4], [9, 2], [16, 6], [22, 3], [28, 5],
      [5, 14], [13, 11], [20, 15], [27, 12],
      [2, 23], [10, 20], [17, 25], [24, 21], [29, 27]];
    blades.forEach(([bx, by]) => {
      ctx.fillRect(bx, by, 2, 1);
      ctx.fillRect(bx, by + 1, 1, 2);
    });

    // Dark grass shadows
    ctx.fillStyle = 'rgba(40, 120, 35, 0.3)';
    [[7, 8], [19, 18], [4, 27], [25, 8]].forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 3, 2);
    });
  }

  _paintDirt(ctx) {
    const ts = this._ts;
    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#c8a868');
    bg.addColorStop(1, '#b89858');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);

    // Pebbles with highlight/shadow (3D rocks)
    [[7, 8, 3], [20, 5, 2.5], [26, 18, 3], [12, 24, 2], [5, 16, 2]].forEach(([px, py, r]) => {
      this._sphere(ctx, px, py, r, '#a08050', '#c0a070', '#806838');
    });

    // Light speckles
    ctx.fillStyle = 'rgba(210, 190, 140, 0.4)';
    [[3, 3], [15, 14], [28, 10], [10, 28]].forEach(([sx, sy]) => ctx.fillRect(sx, sy, 2, 2));
  }

  _paintTree(ctx) {
    const ts = this._ts;

    // Ground beneath
    ctx.fillStyle = '#4a9840';
    ctx.fillRect(0, 0, ts, ts);
    ctx.fillStyle = 'rgba(55, 130, 45, 0.3)';
    ctx.fillRect(0, 0, ts / 2, ts / 2);
    ctx.fillRect(ts / 2, ts / 2, ts / 2, ts / 2);

    // Shadow on ground
    ctx.fillStyle = 'rgba(20, 50, 15, 0.35)';
    ctx.beginPath();
    ctx.ellipse(ts / 2 + 2, ts - 3, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk with 3D shading
    const trunkG = ctx.createLinearGradient(12, 0, 20, 0);
    trunkG.addColorStop(0, '#5a3820');
    trunkG.addColorStop(0.3, '#7a5838');
    trunkG.addColorStop(0.7, '#6a4828');
    trunkG.addColorStop(1, '#4a2810');
    ctx.fillStyle = trunkG;
    ctx.fillRect(13, 18, 6, 14);
    // Trunk outline
    ctx.strokeStyle = '#2a1808';
    ctx.lineWidth = 1;
    ctx.strokeRect(13, 18, 6, 14);

    // Canopy layers (bottom to top, each smaller and lighter) - Pokemon tree style
    const layers = [
      { y: 16, rx: 14, ry: 8, base: '#2a8030', hi: '#40a048', sh: '#1a6020' },
      { y: 11, rx: 12, ry: 7, base: '#38a040', hi: '#58c060', sh: '#288830' },
      { y: 6, rx: 9, ry: 6, base: '#48b850', hi: '#68d870', sh: '#30a038' },
    ];

    layers.forEach(({ y, rx, ry, base, hi, sh }) => {
      // Main canopy shape
      const g = ctx.createRadialGradient(ts / 2 - 2, y - 1, 0, ts / 2, y, Math.max(rx, ry));
      g.addColorStop(0, hi);
      g.addColorStop(0.6, base);
      g.addColorStop(1, sh);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(ts / 2, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#1a4018';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ts / 2, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Specular highlight on top layer
    ctx.fillStyle = 'rgba(180, 255, 180, 0.3)';
    ctx.beginPath();
    ctx.ellipse(ts / 2 - 3, 3, 4, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintStone(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#d0ccbe';
    ctx.fillRect(0, 0, ts, ts);

    const bh = 8, bw = 16;
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < ts / bw + 1; col++) {
        const bx = col * bw + offset;
        const by = row * bh;
        const shade = ((row * 3 + col * 7) % 5) * 3;

        // Brick face gradient (top-left lit)
        const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
        g.addColorStop(0, `rgb(${218 + shade}, ${214 + shade}, ${204 + shade})`);
        g.addColorStop(1, `rgb(${195 + shade}, ${191 + shade}, ${181 + shade})`);
        ctx.fillStyle = g;
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);

        // Top-left highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
        ctx.fillRect(bx + 1, by + 1, 1, bh - 2);

        // Bottom-right shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
        ctx.fillRect(bx + bw - 2, by + 1, 1, bh - 2);
      }
    }

    // Mortar
    ctx.fillStyle = '#a8a498';
    for (let row = 0; row <= ts / bh; row++) ctx.fillRect(0, row * bh, ts, 1);
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < ts / bw + 2; col++) ctx.fillRect(col * bw + offset, row * bh, 1, bh);
    }
  }

  _paintPath(ctx) {
    const ts = this._ts;
    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#d8c878');
    bg.addColorStop(1, '#c8b860');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);

    ctx.fillStyle = 'rgba(190,170,100,0.25)';
    [[5, 7, 2.5], [18, 14, 2], [27, 24, 2], [10, 26, 1.5]].forEach(([px, py, r]) => {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(230,220,160,0.3)';
    [[12, 4], [24, 18], [6, 20]].forEach(([sx, sy]) => ctx.fillRect(sx, sy, 3, 2));
  }

  _paintCobblestone(ctx) {
    const ts = this._ts;

    // Warm pale base — slightly lighter at top-left for top-down lighting
    const base = ctx.createLinearGradient(0, 0, ts, ts);
    base.addColorStop(0, '#dccdb2');
    base.addColorStop(1, '#c2b497');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, ts, ts);

    // Rounded cobble bodies. Eight irregular stones tiled with subtle gaps so
    // the grout reads as a continuous web rather than a strict grid.
    const stones = [
      { cx: 7, cy: 7, r: 6, body: '#e6d7be', hi: '#f3e9d6', sh: '#a89a82' },
      { cx: 19, cy: 5, r: 5, body: '#dccdb2', hi: '#ece0c6', sh: '#a89a82' },
      { cx: 27, cy: 9, r: 5, body: '#d5c6ab', hi: '#e8dcc4', sh: '#a2947d' },
      { cx: 5, cy: 19, r: 5, body: '#d3c4a9', hi: '#e6dac1', sh: '#9f917a' },
      { cx: 15, cy: 16, r: 6, body: '#e0d0b5', hi: '#efe4cc', sh: '#a89a82' },
      { cx: 25, cy: 21, r: 5, body: '#d8c9ae', hi: '#ebdfc6', sh: '#a3957e' },
      { cx: 9, cy: 27, r: 5, body: '#d5c6ab', hi: '#e8dcc4', sh: '#a2947d' },
      { cx: 22, cy: 28, r: 5, body: '#dccdb2', hi: '#ece0c6', sh: '#a89a82' },
    ];

    // Grout: darker outline drawn first so the stones sit on top
    ctx.fillStyle = '#9a8d76';
    stones.forEach(({ cx, cy, r }) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stone bodies with subtle radial highlight for a soft 3D feel
    stones.forEach(({ cx, cy, r, body, hi, sh }) => {
      const grad = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, 0, cx, cy, r);
      grad.addColorStop(0, hi);
      grad.addColorStop(0.55, body);
      grad.addColorStop(1, sh);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Faint specular dots for stone texture
    ctx.fillStyle = 'rgba(255, 246, 224, 0.45)';
    stones.forEach(({ cx, cy, r }) => {
      ctx.fillRect(cx - Math.floor(r * 0.55), cy - Math.floor(r * 0.55), 2, 2);
    });
  }

  _paintWall(ctx) {
    // Pokemon-style 2D-look-3D wall: cobblestone TOP face + darker STONE FRONT face
    // inside a single 32x32 cell. Fold line at the midpoint, vertical shadow on the
    // front, bottom drop shadow to seat the block on the ground.
    const ts = this._ts;
    const midY = Math.floor(ts / 2);

    const drawStone = (x, y, w, h, body, hi, sh, grout) => {
      ctx.fillStyle = grout;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = body;
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = hi;
      ctx.fillRect(x + 1, y + 1, w - 2, 1);
      ctx.fillRect(x + 1, y + 1, 1, h - 2);
      ctx.fillStyle = sh;
      ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
      ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
    };

    // === FRONT FACE base — darker stone with vertical shadow gradient ===
    const frontGrad = ctx.createLinearGradient(0, midY, 0, ts);
    frontGrad.addColorStop(0, '#9c8e76');
    frontGrad.addColorStop(0.6, '#7e7159');
    frontGrad.addColorStop(1, '#5e5340');
    ctx.fillStyle = frontGrad;
    ctx.fillRect(0, midY, ts, ts - midY);

    // Front-face stones — two staggered rows of small darker stones
    const frontRow1 = [{ x: 0, y: midY + 2 }, { x: 8, y: midY + 2 }, { x: 16, y: midY + 2 }, { x: 24, y: midY + 2 }];
    const frontRow2 = [{ x: -4, y: midY + 8 }, { x: 4, y: midY + 8 }, { x: 12, y: midY + 8 }, { x: 20, y: midY + 8 }, { x: 28, y: midY + 8 }];
    frontRow1.forEach(({ x, y }) =>
      drawStone(x, y, 8, 6, '#a89875', 'rgba(255,250,230,0.35)', 'rgba(0,0,0,0.25)', '#4a3e2a')
    );
    frontRow2.forEach(({ x, y }) =>
      drawStone(x, y, 8, 6, '#8e7d5e', 'rgba(255,250,230,0.22)', 'rgba(0,0,0,0.3)', '#3a2f1e')
    );

    // === TOP FACE base — light gray-cream cobblestone backdrop ===
    ctx.fillStyle = '#cdc6b3';
    ctx.fillRect(0, 0, ts, midY);

    // Top-face stones — three larger rounded stones across the top face
    drawStone(1, 1, 10, 13, '#ebe4d2', 'rgba(255,255,250,0.55)', 'rgba(80,70,55,0.4)', '#9a8d72');
    drawStone(11, 1, 10, 13, '#ede6d4', 'rgba(255,255,250,0.55)', 'rgba(80,70,55,0.4)', '#9a8d72');
    drawStone(21, 1, 10, 13, '#ebe4d2', 'rgba(255,255,250,0.55)', 'rgba(80,70,55,0.4)', '#9a8d72');

    // === FOLD LINE — dark band between top face and front face ===
    ctx.fillStyle = '#3e3624';
    ctx.fillRect(0, midY - 1, ts, 1);
    ctx.fillStyle = 'rgba(255,250,230,0.18)';
    ctx.fillRect(0, midY, ts, 1);

    // === BOTTOM DROP SHADOW — seats the block on the ground below ===
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, ts - 1, ts, 1);
  }

  _paintWallMid(ctx) {
    // Continuous cobblestone TOP face — drawn for wall cells that have another
    // wall directly to the south. From the player's 3/4 perspective these cells
    // are above the wall's visible front, so we only see the cobblestone top.
    // No fold line, no stone-front, no drop shadow at the bottom: this lets
    // vertical wall stacks read as one tall wall.
    const ts = this._ts;

    const drawStone = (x, y, w, h, body, hi, sh, grout) => {
      ctx.fillStyle = grout;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = body;
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = hi;
      ctx.fillRect(x + 1, y + 1, w - 2, 1);
      ctx.fillRect(x + 1, y + 1, 1, h - 2);
      ctx.fillStyle = sh;
      ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
      ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
    };

    // Cobblestone backdrop matching the top half of _paintWall
    ctx.fillStyle = '#cdc6b3';
    ctx.fillRect(0, 0, ts, ts);

    // Two rows of three large rounded cobblestones, slightly staggered to make
    // the vertical seam between adjacent cells less obvious.
    const stoneBody = '#ebe4d2';
    const stoneBodyAlt = '#ede6d4';
    const stoneHi = 'rgba(255,255,250,0.55)';
    const stoneSh = 'rgba(80,70,55,0.4)';
    const stoneGrout = '#9a8d72';

    // Row 1 (y=1..14)
    drawStone(1, 1, 10, 13, stoneBody, stoneHi, stoneSh, stoneGrout);
    drawStone(11, 1, 10, 13, stoneBodyAlt, stoneHi, stoneSh, stoneGrout);
    drawStone(21, 1, 10, 13, stoneBody, stoneHi, stoneSh, stoneGrout);

    // Row 2 (y=16..29) — half-stone offset so adjacent vertical cells don't form
    // a single straight grout line.
    drawStone(-4, 16, 10, 13, stoneBodyAlt, stoneHi, stoneSh, stoneGrout);
    drawStone(6, 16, 10, 13, stoneBody, stoneHi, stoneSh, stoneGrout);
    drawStone(16, 16, 10, 13, stoneBodyAlt, stoneHi, stoneSh, stoneGrout);
    drawStone(26, 16, 10, 13, stoneBody, stoneHi, stoneSh, stoneGrout);
  }

  _paintWallCap(ctx) {
    // Wall overhang sprite — drawn into the cell directly NORTH of a wall whose
    // south neighbor is non-wall ("bottom of run" wall showing its front face).
    // Top half is transparent so the underlying terrain still shows; bottom half
    // contains the cobblestone top of the wall, extending visually upward into
    // the cell above. Painted AFTER the cursor so it occludes part of the cursor
    // when the cursor stands directly north of a wall.
    const ts = this._ts;
    const midY = Math.floor(ts / 2);

    const drawStone = (x, y, w, h, body, hi, sh, grout) => {
      ctx.fillStyle = grout;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = body;
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = hi;
      ctx.fillRect(x + 1, y + 1, w - 2, 1);
      ctx.fillRect(x + 1, y + 1, 1, h - 2);
      ctx.fillStyle = sh;
      ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
      ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
    };

    // Bottom-half cobblestone backdrop — matches _paintWall's top face palette
    ctx.fillStyle = '#cdc6b3';
    ctx.fillRect(0, midY, ts, ts - midY);

    drawStone(1, midY + 1, 10, 13, '#ebe4d2', 'rgba(255,255,250,0.55)', 'rgba(80,70,55,0.4)', '#9a8d72');
    drawStone(11, midY + 1, 10, 13, '#ede6d4', 'rgba(255,255,250,0.55)', 'rgba(80,70,55,0.4)', '#9a8d72');
    drawStone(21, midY + 1, 10, 13, '#ebe4d2', 'rgba(255,255,250,0.55)', 'rgba(80,70,55,0.4)', '#9a8d72');
  }

  _paintCliffN(ctx) {
    // Short cliff edge overlay — drawn on water cells whose north neighbor is
    // non-water playable terrain to make the playable area feel like a higher
    // elevation. Roughly 10 px tall (~1/3 cell), about half the height of the
    // wall's front face, so the border reads as a soft elevation cue rather
    // than another wall.
    const ts = this._ts;
    const cliffH = 10;

    // Thin cobblestone cap at the very top — gives the cliff a "stone edge".
    ctx.fillStyle = '#cdc6b3';
    ctx.fillRect(0, 0, ts, 2);
    ctx.fillStyle = '#9a8d72';
    for (let x = 0; x < ts; x += 10) ctx.fillRect(x, 0, 1, 2);

    // Rocky face beneath the cap with a vertical gradient (lighter to darker).
    const grad = ctx.createLinearGradient(0, 2, 0, cliffH);
    grad.addColorStop(0, '#9c8470');
    grad.addColorStop(1, '#4e3e28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 2, ts, cliffH - 2);

    // Sprinkle of small rocks for texture.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    const rocks = [[3, 4], [10, 5], [18, 3], [24, 6], [28, 4], [6, 7], [14, 7], [21, 7], [2, 7]];
    rocks.forEach(([rx, ry]) => ctx.fillRect(rx, ry, 2, 1));
    ctx.fillStyle = 'rgba(255,220,180,0.25)';
    rocks.slice(0, 4).forEach(([rx, ry]) => ctx.fillRect(rx, ry - 1, 1, 1));

    // Soft shadow line where the cliff meets the water.
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, cliffH, ts, 1);

    // Rest of the cell stays transparent so the water tile underneath shows.
  }

  // ===== GRASS EDGE OVERLAYS =====
  // Small green tufts drawn on the corresponding edge of a non-grass cell to
  // soften its boundary with a grass neighbor. Each painter draws tufts that
  // extend from one edge into the cell; the rest of the sprite is transparent.

  _paintGrassEdge(ctx, tufts, axis) {
    // axis 'h' means tufts are columns of pixels stretching DOWN or UP from an
    // edge; axis 'v' means tufts are rows of pixels stretching LEFT or RIGHT.
    const dark = '#3a7838';
    const mid = '#58a848';
    const tip = '#70c860';
    tufts.forEach(({ start, lengths, edge }) => {
      lengths.forEach((len, i) => {
        if (len <= 0) return;
        const x = axis === 'h' ? start + i : edge === 'left' ? 0 : this._ts - len;
        const y = axis === 'h' ? (edge === 'top' ? 0 : this._ts - len) : start + i;
        const w = axis === 'h' ? 1 : len;
        const h = axis === 'h' ? len : 1;
        ctx.fillStyle = dark;
        ctx.fillRect(x, y, w, h);
        if (len >= 2) {
          // Lighter body next to the tip edge
          if (axis === 'h') {
            const innerY = edge === 'top' ? 0 : this._ts - 1;
            ctx.fillStyle = mid;
            ctx.fillRect(x, edge === 'top' ? 0 : y, 1, Math.min(len, 2));
            ctx.fillStyle = tip;
            ctx.fillRect(x, innerY, 1, 1);
          } else {
            const innerX = edge === 'left' ? 0 : this._ts - 1;
            ctx.fillStyle = mid;
            ctx.fillRect(edge === 'left' ? x : x + len - 2, y, Math.min(len, 2), 1);
            ctx.fillStyle = tip;
            ctx.fillRect(innerX, y, 1, 1);
          }
        }
      });
    });
  }

  _paintGrassEdgeN(ctx) {
    this._paintGrassEdge(
      ctx,
      [
        { start: 1, lengths: [3, 5, 4, 2], edge: 'top' },
        { start: 7, lengths: [2, 4, 3], edge: 'top' },
        { start: 12, lengths: [4, 5, 6, 4, 3], edge: 'top' },
        { start: 19, lengths: [3, 5, 4], edge: 'top' },
        { start: 24, lengths: [2, 4, 3, 5, 3], edge: 'top' },
        { start: 30, lengths: [3, 2], edge: 'top' },
      ],
      'h'
    );
  }

  _paintGrassEdgeS(ctx) {
    this._paintGrassEdge(
      ctx,
      [
        { start: 2, lengths: [3, 5, 4, 2], edge: 'bottom' },
        { start: 8, lengths: [2, 4, 3], edge: 'bottom' },
        { start: 13, lengths: [4, 5, 6, 4, 3], edge: 'bottom' },
        { start: 20, lengths: [3, 5, 4], edge: 'bottom' },
        { start: 25, lengths: [2, 4, 3, 5, 3], edge: 'bottom' },
      ],
      'h'
    );
  }

  _paintGrassEdgeW(ctx) {
    this._paintGrassEdge(
      ctx,
      [
        { start: 1, lengths: [3, 5, 4, 2], edge: 'left' },
        { start: 7, lengths: [2, 4, 3], edge: 'left' },
        { start: 12, lengths: [4, 5, 6, 4, 3], edge: 'left' },
        { start: 19, lengths: [3, 5, 4], edge: 'left' },
        { start: 24, lengths: [2, 4, 3, 5, 3], edge: 'left' },
        { start: 30, lengths: [3, 2], edge: 'left' },
      ],
      'v'
    );
  }

  _paintGrassEdgeE(ctx) {
    this._paintGrassEdge(
      ctx,
      [
        { start: 2, lengths: [3, 5, 4, 2], edge: 'right' },
        { start: 8, lengths: [2, 4, 3], edge: 'right' },
        { start: 13, lengths: [4, 5, 6, 4, 3], edge: 'right' },
        { start: 20, lengths: [3, 5, 4], edge: 'right' },
        { start: 25, lengths: [2, 4, 3, 5, 3], edge: 'right' },
      ],
      'v'
    );
  }

  // ===== 1x1 DECORATIONS (transparent backgrounds — overlay on any tile) =====

  _paintFlowerCluster(ctx) {
    // A handful of small flowers with green stems. Background stays
    // transparent so the decoration overlays whatever tile sits underneath.
    const flowers = [
      { x: 6, y: 18, petal: '#ff8fb0', center: '#ffe060' },
      { x: 13, y: 22, petal: '#ffffff', center: '#ffe060' },
      { x: 21, y: 17, petal: '#a8d0ff', center: '#ffffff' },
      { x: 25, y: 24, petal: '#ffa040', center: '#ffe060' },
      { x: 10, y: 27, petal: '#e0a0ff', center: '#ffffff' },
    ];
    flowers.forEach(({ x, y, petal, center }) => {
      // Short green stem
      ctx.fillStyle = '#3a7838';
      ctx.fillRect(x + 1, y + 2, 1, 3);
      // 4 petals in a cross + center pixel
      ctx.fillStyle = petal;
      ctx.fillRect(x, y, 1, 1);
      ctx.fillRect(x + 2, y, 1, 1);
      ctx.fillRect(x + 1, y - 1, 1, 1);
      ctx.fillRect(x + 1, y + 1, 1, 1);
      ctx.fillStyle = center;
      ctx.fillRect(x + 1, y, 1, 1);
    });
  }

  _paintMushroom(ctx) {
    // A single red-capped mushroom near the centre of the cell.
    const cx = Math.floor(this._ts / 2);
    const baseY = Math.floor(this._ts * 0.7);

    // Tiny shadow beneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 5, 5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // White stem
    ctx.fillStyle = '#f4ecd8';
    ctx.fillRect(cx - 1, baseY, 3, 4);
    ctx.fillStyle = '#bca988';
    ctx.fillRect(cx - 1, baseY + 3, 3, 1);

    // Red cap — wider half-dome
    ctx.fillStyle = '#c8242a';
    ctx.fillRect(cx - 4, baseY - 1, 9, 2);
    ctx.fillRect(cx - 3, baseY - 3, 7, 2);
    ctx.fillRect(cx - 2, baseY - 4, 5, 1);
    // Brighter highlight on top-left
    ctx.fillStyle = '#f25a5a';
    ctx.fillRect(cx - 3, baseY - 3, 4, 1);
    ctx.fillRect(cx - 2, baseY - 4, 2, 1);
    // White spots
    ctx.fillStyle = '#fcf6e7';
    ctx.fillRect(cx - 2, baseY - 2, 1, 1);
    ctx.fillRect(cx + 1, baseY - 1, 1, 1);
    ctx.fillRect(cx + 3, baseY, 1, 1);
  }

  _paintTallGrass(ctx) {
    // Several tall grass blades clumped near the bottom of the cell.
    const blades = [
      { x: 6, h: 9, lean: 0 },
      { x: 9, h: 11, lean: -1 },
      { x: 13, h: 10, lean: 0 },
      { x: 16, h: 12, lean: 1 },
      { x: 20, h: 9, lean: 0 },
      { x: 23, h: 11, lean: -1 },
      { x: 26, h: 8, lean: 0 },
    ];
    const baseY = this._ts - 2;
    blades.forEach(({ x, h, lean }) => {
      ctx.fillStyle = '#1f5a1c';
      for (let i = 0; i < h; i++) {
        const offset = Math.round((lean * i) / 6);
        ctx.fillRect(x + offset, baseY - i, 1, 1);
      }
      // Light-green tip
      ctx.fillStyle = '#7ec860';
      const tipOffset = Math.round((lean * (h - 1)) / 6);
      ctx.fillRect(x + tipOffset, baseY - (h - 1), 1, 1);
    });
  }

  _paintTreasureChest(ctx) {
    const ts = this._ts;

    // Drop shadow under the chest
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(ts / 2, ts - 4, 11, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest body: warm brown wood with a slightly darker base
    const bodyGrad = ctx.createLinearGradient(0, 14, 0, 26);
    bodyGrad.addColorStop(0, '#a3702f');
    bodyGrad.addColorStop(1, '#7a4f1f');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(7, 14, 18, 12);

    // Domed lid
    const lidGrad = ctx.createLinearGradient(0, 8, 0, 16);
    lidGrad.addColorStop(0, '#b7853a');
    lidGrad.addColorStop(1, '#8b5c25');
    ctx.fillStyle = lidGrad;
    ctx.fillRect(8, 9, 16, 6);
    ctx.fillRect(7, 11, 18, 4);

    // Plank dividers on body
    ctx.fillStyle = 'rgba(46, 26, 8, 0.55)';
    ctx.fillRect(13, 14, 1, 12);
    ctx.fillRect(19, 14, 1, 12);

    // Brass trim — top and bottom band
    ctx.fillStyle = '#e0b04a';
    ctx.fillRect(7, 14, 18, 2);
    ctx.fillRect(7, 24, 18, 2);
    ctx.fillStyle = 'rgba(255,236,170,0.55)';
    ctx.fillRect(7, 14, 18, 1);

    // Brass corner studs
    ctx.fillStyle = '#d2a23a';
    [[8, 9], [22, 9], [8, 24], [22, 24]].forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 2, 2);
    });

    // Keyhole plate
    ctx.fillStyle = '#e0b04a';
    ctx.fillRect(15, 18, 4, 5);
    ctx.fillStyle = '#1c1108';
    ctx.fillRect(16, 19, 2, 3);

    // Outline so the chest reads cleanly on busy floors
    ctx.fillStyle = '#1c1108';
    ctx.fillRect(7, 9, 1, 17);
    ctx.fillRect(24, 9, 1, 17);
    ctx.fillRect(8, 9, 16, 1);
    ctx.fillRect(7, 26, 18, 1);
  }

  _paintBridge(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#8b6845';
    ctx.fillRect(0, 0, ts, ts);

    for (let y = 0; y < ts; y += 8) {
      ctx.fillStyle = '#6b4828';
      ctx.fillRect(0, y, ts, 2);
      ctx.fillStyle = 'rgba(200,160,100,0.2)';
      ctx.fillRect(0, y + 2, ts, 1);
    }
    ctx.strokeStyle = 'rgba(160,120,80,0.2)';
    ctx.lineWidth = 1;
    for (let y = 3; y < ts; y += 8) {
      ctx.beginPath();
      for (let x = 0; x < ts; x++) {
        const gy = y + Math.sin(x * 0.4) * 0.8;
        x === 0 ? ctx.moveTo(x, gy) : ctx.lineTo(x, gy);
      }
      ctx.stroke();
    }
  }

  _paintSand(ctx) {
    const ts = this._ts;
    const bg = ctx.createRadialGradient(ts / 2, ts / 2, 0, ts / 2, ts / 2, ts * 0.8);
    bg.addColorStop(0, '#e4d480');
    bg.addColorStop(1, '#d8c870');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);
    ctx.fillStyle = 'rgba(180,160,80,0.15)';
    [[8, 6, 2.5], [22, 20, 3], [14, 28, 2]].forEach(([px, py, r]) => {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _paintRuins(ctx) {
    this._paintStone(ctx);
    // Cracks with shadow
    ctx.strokeStyle = 'rgba(40, 40, 30, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(14, 14);
    ctx.lineTo(10, 24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 6);
    ctx.lineTo(20, 16);
    ctx.stroke();
    // Moss
    ctx.fillStyle = 'rgba(70, 150, 50, 0.5)';
    ctx.beginPath();
    ctx.arc(4, 26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(26, 5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintField(ctx) {
    const ts = this._ts;
    ctx.fillStyle = '#50b858';
    ctx.fillRect(0, 0, ts, ts);
    // Crop rows
    for (let y = 0; y < ts; y += 6) {
      ctx.fillStyle = '#68d070';
      for (let x = 0; x < ts; x += 4) ctx.fillRect(x + 1, y, 2, 4);
      ctx.fillStyle = 'rgba(40, 140, 45, 0.3)';
      ctx.fillRect(0, y + 4, ts, 2);
    }
  }

  _paintTestGround(ctx) {
    const ts = this._ts;
    const bg = ctx.createLinearGradient(0, 0, ts, ts);
    bg.addColorStop(0, '#b090c8');
    bg.addColorStop(1, '#a080b8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);
    ctx.fillStyle = 'rgba(180, 150, 210, 0.25)';
    for (let y = 0; y < ts; y += 4) for (let x = 0; x < ts; x += 4)
      if ((x + y) % 8 === 0) ctx.fillRect(x, y, 2, 2);
  }

  _paintBossArea(ctx) {
    const ts = this._ts;
    const bg = ctx.createRadialGradient(ts / 2, ts / 2, 0, ts / 2, ts / 2, ts * 0.6);
    bg.addColorStop(0, '#d04040');
    bg.addColorStop(1, '#901818');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ts, ts);
    ctx.strokeStyle = '#601010';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, ts - 2, ts - 2);
    ctx.fillStyle = 'rgba(255, 80, 60, 0.15)';
    ctx.fillRect(4, 4, ts - 8, ts - 8);
  }

  _paintRampRight(ctx) {
    const ts = this._ts;
    // Left half is ground
    ctx.fillStyle = '#90a0b8';
    ctx.fillRect(0, 0, ts, ts);

    // Right half is wall with brick pattern
    ctx.fillStyle = '#5a6878';
    ctx.fillRect(ts / 2, 0, ts / 2, ts);
    const bh = 6, bw = 8;
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = 0; col < ts / 2 / bw + 1; col++) {
        const bx = ts / 2 + col * bw + offset;
        const by = row * bh;
        ctx.fillStyle = `rgb(${90 + (row + col) % 3 * 2}, ${105 + (row + col) % 3 * 2}, ${118 + (row + col) % 3 * 2})`;
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
      }
      ctx.fillStyle = '#3a4858';
      ctx.fillRect(ts / 2, row * bh, ts / 2, 1);
    }

    // Slope gradient transition
    const slope = ctx.createLinearGradient(ts / 2 - 4, 0, ts / 2 + 4, 0);
    slope.addColorStop(0, '#90a0b8');
    slope.addColorStop(1, '#4a5868');
    ctx.fillStyle = slope;
    ctx.fillRect(ts / 2 - 4, 0, 8, ts);
  }

  _paintRampLeft(ctx) {
    const ts = this._ts;
    // Right half is ground
    ctx.fillStyle = '#90a0b8';
    ctx.fillRect(0, 0, ts, ts);

    // Left half is wall with brick pattern
    ctx.fillStyle = '#5a6878';
    ctx.fillRect(0, 0, ts / 2, ts);
    const bh = 6, bw = 8;
    for (let row = 0; row < ts / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < ts / 2 / bw + 1; col++) {
        const bx = col * bw + offset;
        const by = row * bh;
        if (bx + bw <= 0 || bx >= ts / 2) continue;
        ctx.fillStyle = `rgb(${90 + (row + col) % 3 * 2}, ${105 + (row + col) % 3 * 2}, ${118 + (row + col) % 3 * 2})`;
        ctx.fillRect(Math.max(0, bx + 1), by + 1, Math.min(bw - 2, ts / 2 - bx - 1), bh - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(Math.max(0, bx + 1), by + 1, Math.min(bw - 2, ts / 2 - bx - 1), 1);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(Math.max(0, bx + 1), by + bh - 2, Math.min(bw - 2, ts / 2 - bx - 1), 1);
      }
      ctx.fillStyle = '#3a4858';
      ctx.fillRect(0, row * bh, ts / 2, 1);
    }

    // Slope gradient transition
    const slope = ctx.createLinearGradient(ts / 2 - 4, 0, ts / 2 + 4, 0);
    slope.addColorStop(0, '#4a5868');
    slope.addColorStop(1, '#90a0b8');
    ctx.fillStyle = slope;
    ctx.fillRect(ts / 2 - 4, 0, 8, ts);
  }

  _paintVoid(ctx) {
    ctx.fillStyle = '#0e0e14';
    ctx.fillRect(0, 0, this._ts, this._ts);
  }

  _paintRock(ctx) {
    // Cobblestone background underneath so the rock reads as a boulder set
    // into the floor rather than floating.
    this._paintCobblestone(ctx);

    const ts = this._ts;
    const cx = ts / 2;
    const cy = ts / 2 + 2;
    const r = ts * 0.32;

    // Soft ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.95, r * 1.0, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Irregular pebble silhouette — eight-vertex polygon offset slightly to
    // the right so the rock has a natural lopsided lean, not a perfect circle.
    const verts = [
      [cx - r * 0.95, cy + r * 0.05],
      [cx - r * 0.75, cy - r * 0.55],
      [cx - r * 0.15, cy - r * 0.95],
      [cx + r * 0.45, cy - r * 0.85],
      [cx + r * 0.95, cy - r * 0.35],
      [cx + r * 0.85, cy + r * 0.35],
      [cx + r * 0.35, cy + r * 0.85],
      [cx - r * 0.45, cy + r * 0.75],
    ];

    // Dark outline first (drawn slightly larger) so the body sits inside a
    // crisp pixel-art border.
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath();
    ctx.moveTo(verts[0][0] - 1, verts[0][1]);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i][0] + (i < 4 ? -1 : 1), verts[i][1] + (i > 2 && i < 6 ? -1 : 1));
    }
    ctx.closePath();
    ctx.fill();

    // Body gradient — top-down lighting from cool light grey to mid grey
    const body = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    body.addColorStop(0, '#cccfd3');
    body.addColorStop(0.55, '#a8acb1');
    body.addColorStop(1, '#7d8186');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(verts[0][0], verts[0][1]);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i][0], verts[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    // Top-left highlight — a small inner polygon for the soft specular
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.45, cy - r * 0.55);
    ctx.lineTo(cx - r * 0.05, cy - r * 0.75);
    ctx.lineTo(cx + r * 0.25, cy - r * 0.55);
    ctx.lineTo(cx + r * 0.05, cy - r * 0.25);
    ctx.lineTo(cx - r * 0.35, cy - r * 0.15);
    ctx.closePath();
    ctx.fill();

    // A couple of darker speckles for texture
    ctx.fillStyle = 'rgba(60, 64, 70, 0.55)';
    ctx.fillRect(Math.round(cx + r * 0.25), Math.round(cy + r * 0.15), 2, 2);
    ctx.fillRect(Math.round(cx - r * 0.4), Math.round(cy + r * 0.35), 2, 2);
  }

  // ========== CHARACTER / ENTITY PAINTERS ==========

  _paintCursor(ctx, direction = 's', phase = 0) {
    // Chibi-proportioned trainer — big round black hair forming a soft
    // helmet over a small peach face, compact black body with a white
    // trim, short legs, and crisp white shoes. Eight frames: four
    // directions × two walk phases. Phase 0 is idle, phase 1 is the
    // mid-step. CharacterSprites alternates phases slowly when standing
    // still (subtle bob) and quickly while moving (walk cycle).

    // The source sprite is painted at its base pixel layout (no internal
    // scaling here). _drawCursor in CanvasGameRenderer enlarges the sprite
    // at draw time and anchors the feet at the cell's bottom edge so the
    // head overflows upward — same trick Pokemon uses to fit a taller
    // trainer in a 32x32 movement grid without clipping.
    ctx.save();

    // Drop shadow under the feet
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 6, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ----- HEAD (rows 3..16) — round black hair forms the silhouette -----
    const hair = '#1a1a1a';
    const hairHi = '#3a3a3a';

    // Crown row (narrowest) — slight tuft up top
    ctx.fillStyle = hair;
    ctx.fillRect(12, 3, 8, 1);
    // Main hair puff
    ctx.fillRect(11, 4, 10, 8);
    // Side tufts that bulge out at the temples
    ctx.fillRect(10, 6, 1, 5);
    ctx.fillRect(21, 6, 1, 5);
    // Subtle hair shine on top-left
    ctx.fillStyle = hairHi;
    ctx.fillRect(13, 4, 2, 1);
    ctx.fillRect(12, 5, 1, 1);

    // Face area (skin) — small patch framed by hair on three sides
    if (direction === 's') {
      ctx.fillStyle = '#fad7b0';
      ctx.fillRect(12, 11, 8, 5);
      // Chin shadow
      ctx.fillStyle = '#e6b88b';
      ctx.fillRect(12, 15, 8, 1);
      // Hair side bangs covering the cheeks slightly
      ctx.fillStyle = hair;
      ctx.fillRect(11, 11, 1, 4);
      ctx.fillRect(20, 11, 1, 4);
      // Front fringe over forehead
      ctx.fillRect(13, 11, 6, 1);
      // Eyes — two dark pixels
      ctx.fillStyle = '#1a1d3a';
      ctx.fillRect(13, 13, 1, 1);
      ctx.fillRect(18, 13, 1, 1);
      // Hint of a smile
      ctx.fillStyle = '#c08868';
      ctx.fillRect(15, 15, 2, 1);
    } else if (direction === 'n') {
      // Pure back of head — hair covers everything down to the neck
      ctx.fillStyle = hair;
      ctx.fillRect(11, 11, 10, 4);
      // Neck nape
      ctx.fillStyle = '#e6b88b';
      ctx.fillRect(14, 15, 4, 1);
    } else if (direction === 'e') {
      // 3/4 east view — hair on the west side, face peeks on the east
      ctx.fillStyle = hair;
      ctx.fillRect(11, 11, 4, 5);
      ctx.fillStyle = '#fad7b0';
      ctx.fillRect(15, 11, 5, 5);
      ctx.fillStyle = '#e6b88b';
      ctx.fillRect(15, 15, 5, 1);
      // Hair fringe over forehead on this side
      ctx.fillStyle = hair;
      ctx.fillRect(15, 11, 4, 1);
      ctx.fillRect(20, 11, 1, 4);
      // Single visible eye
      ctx.fillStyle = '#1a1d3a';
      ctx.fillRect(17, 13, 1, 1);
    } else {
      // 'w' — mirror of east
      ctx.fillStyle = hair;
      ctx.fillRect(17, 11, 4, 5);
      ctx.fillStyle = '#fad7b0';
      ctx.fillRect(12, 11, 5, 5);
      ctx.fillStyle = '#e6b88b';
      ctx.fillRect(12, 15, 5, 1);
      ctx.fillStyle = hair;
      ctx.fillRect(13, 11, 4, 1);
      ctx.fillRect(11, 11, 1, 4);
      ctx.fillStyle = '#1a1d3a';
      ctx.fillRect(14, 13, 1, 1);
    }

    // ----- BODY (rows 16..22) — compact black torso -----
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(12, 16, 8, 6);
    // Body top highlight
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(12, 16, 8, 1);
    // White trim band
    ctx.fillStyle = '#f4ecd8';
    ctx.fillRect(12, 19, 8, 1);

    // Arms (small skin tabs at sides)
    ctx.fillStyle = '#fad7b0';
    if (direction === 's' || direction === 'n') {
      const lArm = phase === 1 ? -1 : 0;
      const rArm = phase === 1 ? 1 : 0;
      ctx.fillRect(11, 17 + lArm, 1, 3);
      ctx.fillRect(20, 17 + rArm, 1, 3);
    } else if (direction === 'e') {
      ctx.fillRect(11, 17 + (phase === 1 ? 1 : 0), 1, 3);
    } else {
      ctx.fillRect(20, 17 + (phase === 1 ? 1 : 0), 1, 3);
    }

    // ----- LEGS (rows 22..26) — short black pants -----
    ctx.fillStyle = '#0a0a0a';
    if (phase === 0) {
      ctx.fillRect(13, 22, 2, 4);
      ctx.fillRect(17, 22, 2, 4);
    } else if (direction === 's' || direction === 'n') {
      ctx.fillRect(12, 22, 2, 4);
      ctx.fillRect(18, 22, 2, 3);
    } else if (direction === 'e') {
      ctx.fillRect(13, 22, 2, 4);
      ctx.fillRect(18, 22, 2, 3);
    } else {
      ctx.fillRect(12, 22, 2, 3);
      ctx.fillRect(17, 22, 2, 4);
    }

    // ----- SHOES (rows 25..27) — white toes -----
    ctx.fillStyle = '#f0ece0';
    if (phase === 0) {
      ctx.fillRect(13, 26, 2, 1);
      ctx.fillRect(17, 26, 2, 1);
    } else if (direction === 's' || direction === 'n') {
      ctx.fillRect(12, 26, 2, 1);
      ctx.fillRect(18, 25, 2, 1);
    } else if (direction === 'e') {
      ctx.fillRect(13, 26, 2, 1);
      ctx.fillRect(18, 25, 2, 1);
    } else {
      ctx.fillRect(12, 25, 2, 1);
      ctx.fillRect(17, 26, 2, 1);
    }

    ctx.restore();
  }

  _paintVimKey(ctx) {
    const ts = this._ts;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(7, 6, ts - 11, ts - 8);

    // Keycap face
    const face = ctx.createLinearGradient(0, 3, 0, ts - 4);
    face.addColorStop(0, '#ffffff');
    face.addColorStop(0.1, '#f4f4f4');
    face.addColorStop(0.85, '#e0e0e0');
    face.addColorStop(1, '#c8c8c8');
    ctx.fillStyle = face;
    ctx.fillRect(5, 3, ts - 11, ts - 8);

    // Outline
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 3, ts - 11, ts - 8);

    // Top shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(7, 4, ts - 15, 2);
  }

  _paintCollectibleKey(ctx) {
    const ts = this._ts;

    // Ring
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(11, 11, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(11, 11, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Shaft
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(16, 9, 12, 3);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(16, 12, 12, 1);

    // Teeth
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(23, 12, 2, 4);
    ctx.fillRect(27, 12, 2, 4);

    // Outline
    ctx.strokeStyle = '#705000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(11, 11, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // Shine
    ctx.fillStyle = 'rgba(255,255,220,0.7)';
    ctx.beginPath();
    ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _paintGateOpen(ctx) {
    const ts = this._ts;
    // Pillars
    [[4, 9], [ts - 10, ts - 10]].forEach(([x]) => {
      const pg = ctx.createLinearGradient(x, 0, x + 6, 0);
      pg.addColorStop(0, '#1a8038');
      pg.addColorStop(0.5, '#28a848');
      pg.addColorStop(1, '#1a7030');
      ctx.fillStyle = pg;
      ctx.fillRect(x, 3, 6, ts - 3);
      ctx.strokeStyle = '#0a4018';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 3, 6, ts - 3);
    });
    // Right pillar
    const pg2 = ctx.createLinearGradient(ts - 10, 0, ts - 4, 0);
    pg2.addColorStop(0, '#1a8038');
    pg2.addColorStop(0.5, '#28a848');
    pg2.addColorStop(1, '#1a7030');
    ctx.fillStyle = pg2;
    ctx.fillRect(ts - 10, 3, 6, ts - 3);
    ctx.strokeStyle = '#0a4018';
    ctx.lineWidth = 1;
    ctx.strokeRect(ts - 10, 3, 6, ts - 3);
    // Arch
    ctx.fillStyle = '#28a848';
    ctx.fillRect(4, 3, ts - 8, 4);
    ctx.strokeStyle = '#0a4018';
    ctx.strokeRect(4, 3, ts - 8, 4);
    // Opening
    ctx.fillStyle = '#0a2810';
    ctx.fillRect(10, 7, ts - 20, ts - 7);
  }

  _paintGateClosed(ctx) {
    const ts = this._ts;
    // Door
    const door = ctx.createLinearGradient(6, 0, ts - 6, 0);
    door.addColorStop(0, '#7a3a0e');
    door.addColorStop(0.3, '#a0622d');
    door.addColorStop(0.7, '#965828');
    door.addColorStop(1, '#6a2e08');
    ctx.fillStyle = door;
    ctx.fillRect(5, 2, ts - 10, ts - 3);
    // Frame
    ctx.strokeStyle = '#3a1808';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 2, ts - 10, ts - 3);
    // Panels with 3D inset
    [[8, 5, 7, 10], [ts - 15, 5, 7, 10], [8, 18, 7, 9], [ts - 15, 18, 7, 9]].forEach(([px, py, pw, ph]) => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(px, py, pw, 1);
      ctx.fillRect(px, py, 1, ph);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(px, py + ph - 1, pw, 1);
      ctx.fillRect(px + pw - 1, py, 1, ph);
    });
    // Knob
    const knob = ctx.createRadialGradient(ts - 10, 16, 0, ts - 10, 16, 3.5);
    knob.addColorStop(0, '#ffe860');
    knob.addColorStop(1, '#b88a18');
    ctx.fillStyle = knob;
    ctx.beginPath();
    ctx.arc(ts - 10, 16, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#705000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ts - 10, 16, 3.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ===== NPC PAINTERS (RPG sprite-character style) =====

  _paintChibiNPC(ctx, palette) {
    // Shared chibi painter for robed/hooded NPCs. Mirrors the cursor's
    // proportions — round hood-or-hair dome, small skin face, compact
    // robed body, short legs, light shoes. `palette` provides theme
    // colors; `prop` is an optional callback for NPC-specific accessories
    // (caret glow, scroll, quill, etc.).
    const {
      hair,
      hairHi,
      skin = '#fad7b0',
      skinShadow = '#e6b88b',
      robe,
      robeHi,
      robeTrim = '#f4ecd8',
      eyes = '#1a1d3a',
      shoe = '#f0ece0',
      prop,
    } = palette;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 6, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair / hood — chibi round dome
    ctx.fillStyle = hair;
    ctx.fillRect(12, 3, 8, 1);
    ctx.fillRect(11, 4, 10, 8);
    ctx.fillRect(10, 6, 1, 5);
    ctx.fillRect(21, 6, 1, 5);
    if (hairHi) {
      ctx.fillStyle = hairHi;
      ctx.fillRect(13, 4, 2, 1);
      ctx.fillRect(12, 5, 1, 1);
    }

    // Face (south view only — NPCs always face the player here)
    ctx.fillStyle = skin;
    ctx.fillRect(12, 11, 8, 5);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(12, 15, 8, 1);
    ctx.fillStyle = hair;
    ctx.fillRect(11, 11, 1, 4);
    ctx.fillRect(20, 11, 1, 4);
    ctx.fillRect(13, 11, 6, 1);
    ctx.fillStyle = eyes;
    ctx.fillRect(13, 13, 1, 1);
    ctx.fillRect(18, 13, 1, 1);

    // Robe body
    ctx.fillStyle = robe;
    ctx.fillRect(11, 16, 10, 6);
    if (robeHi) {
      ctx.fillStyle = robeHi;
      ctx.fillRect(11, 16, 10, 1);
    }
    if (robeTrim) {
      ctx.fillStyle = robeTrim;
      ctx.fillRect(11, 19, 10, 1);
    }
    // Sleeve hands at sides
    ctx.fillStyle = skin;
    ctx.fillRect(10, 17, 1, 3);
    ctx.fillRect(21, 17, 1, 3);
    // Robe hem flares for grounded look
    ctx.fillStyle = robe;
    ctx.fillRect(10, 22, 12, 3);
    // Shoes
    ctx.fillStyle = shoe;
    ctx.fillRect(12, 25, 3, 1);
    ctx.fillRect(17, 25, 3, 1);

    if (typeof prop === 'function') prop(ctx);
  }

  _paintCaretSpirit(ctx) {
    // Chibi spirit: cyan hood with a soft glow halo and a caret rune
    // floating above the head. Robe matches the original teal palette.
    this._paintChibiNPC(ctx, {
      hair: '#28a0a0',
      hairHi: '#5ce0e0',
      skin: '#e8fafa',
      skinShadow: '#a8d8d8',
      robe: '#1a6060',
      robeHi: '#28a0a0',
      robeTrim: '#90f0f0',
      eyes: '#0a3030',
      prop: (c) => {
        const aura = c.createRadialGradient(16, 6, 0, 16, 6, 10);
        aura.addColorStop(0, 'rgba(144, 240, 240, 0.4)');
        aura.addColorStop(1, 'rgba(144, 240, 240, 0)');
        c.fillStyle = aura;
        c.fillRect(4, -2, 24, 14);
        c.fillStyle = '#e0ffff';
        c.fillRect(16, 0, 1, 1);
        c.fillRect(15, 1, 1, 1);
        c.fillRect(17, 1, 1, 1);
        c.fillRect(14, 2, 1, 1);
        c.fillRect(18, 2, 1, 1);
      },
    });
  }

  _paintSyntaxWisp(ctx) {
    // Chibi wisp: purple hood with a small tilde rune floating above.
    this._paintChibiNPC(ctx, {
      hair: '#5a3070',
      hairHi: '#a070c0',
      robe: '#4a2868',
      robeHi: '#7848a0',
      robeTrim: '#e6e6fa',
      eyes: '#1a0830',
      prop: (c) => {
        const aura = c.createRadialGradient(16, 6, 0, 16, 6, 9);
        aura.addColorStop(0, 'rgba(200, 160, 230, 0.4)');
        aura.addColorStop(1, 'rgba(200, 160, 230, 0)');
        c.fillStyle = aura;
        c.fillRect(4, -2, 24, 14);
        c.fillStyle = '#e6e6fa';
        // small tilde ~ floating
        c.fillRect(14, 1, 1, 1);
        c.fillRect(15, 0, 1, 1);
        c.fillRect(16, 1, 1, 1);
        c.fillRect(17, 2, 1, 1);
        c.fillRect(18, 1, 1, 1);
      },
    });
  }

  _paintBugKing(ctx) {
    // Chibi villain in a dark red robe wearing a golden crown.
    this._paintChibiNPC(ctx, {
      hair: '#401010',
      hairHi: '#701010',
      robe: '#801515',
      robeHi: '#b02020',
      robeTrim: '#ffd700',
      eyes: '#ffff00',
      prop: (c) => {
        // Crown spikes above the head
        c.fillStyle = '#ffd700';
        c.fillRect(10, 2, 12, 2);
        c.fillRect(11, 1, 1, 1);
        c.fillRect(15, 0, 2, 1);
        c.fillRect(20, 1, 1, 1);
        c.fillRect(13, 1, 1, 1);
        c.fillRect(18, 1, 1, 1);
        // Jewels on the crown
        c.fillStyle = '#ff3030';
        c.fillRect(15, 2, 2, 1);
        c.fillStyle = '#c02020';
        c.fillRect(11, 3, 1, 1);
        c.fillRect(20, 3, 1, 1);
      },
    });
  }

  _paintCaretStone(ctx) {
    // Chibi stone-monk: grey-green hooded figure with a caret rune on the
    // chest and a tiny moss patch on the shoulder. Keeps the ancient/mossy
    // identity while matching the cursor's proportions.
    this._paintChibiNPC(ctx, {
      hair: '#586858',
      hairHi: '#788870',
      robe: '#788870',
      robeHi: '#98a890',
      robeTrim: '#a0c8a0',
      skin: '#a8b8a0',
      skinShadow: '#788870',
      eyes: '#202820',
      prop: (c) => {
        // Caret rune on chest
        c.fillStyle = '#a0c8a0';
        c.fillRect(16, 17, 1, 1);
        c.fillRect(15, 18, 1, 1);
        c.fillRect(17, 18, 1, 1);
        // Moss patch on the hood
        c.fillStyle = 'rgba(60, 140, 50, 0.7)';
        c.fillRect(11, 5, 2, 1);
        c.fillRect(12, 6, 1, 1);
      },
    });
  }

  _paintMazeScribe(ctx) {
    // Chibi scribe with a brown hooded robe and a small parchment scroll
    // held in front of the chest.
    this._paintChibiNPC(ctx, {
      hair: '#4a2e18',
      hairHi: '#7a5238',
      robe: '#6e4823',
      robeHi: '#8b5e3c',
      robeTrim: '#3a1f0c',
      eyes: '#2a1808',
      prop: (c) => {
        // Scroll held at the chest
        c.fillStyle = '#f5deb3';
        c.fillRect(13, 17, 6, 4);
        // Rolled ends
        c.fillStyle = '#8b4513';
        c.fillRect(12, 17, 1, 4);
        c.fillRect(19, 17, 1, 4);
        // Faint ink lines on the scroll
        c.fillStyle = 'rgba(74,46,24,0.5)';
        c.fillRect(14, 18, 4, 1);
        c.fillRect(14, 20, 3, 1);
      },
    });
  }

  _paintDeletionEcho(ctx) {
    // Chibi ghost: ghostly grey hood, pale skin, ghostly body. Red eyes
    // keep the spooky identity.
    this._paintChibiNPC(ctx, {
      hair: '#6e7878',
      hairHi: '#a0b0b0',
      skin: '#c8d4d4',
      skinShadow: '#90a0a0',
      robe: '#4a5858',
      robeHi: '#788888',
      robeTrim: '#a8b8b8',
      eyes: '#ff3030',
    });
  }

  _paintInsertScribe(ctx) {
    // Chibi scribe with a blue hooded robe and a small quill poking up
    // from the side, ink tip at the top.
    this._paintChibiNPC(ctx, {
      hair: '#1a2868',
      hairHi: '#3a5dc0',
      robe: '#2a4aa0',
      robeHi: '#4169e1',
      robeTrim: '#a8c8ff',
      eyes: '#1a1a40',
      prop: (c) => {
        // Quill shaft — light blue line angled up-right
        c.fillStyle = '#a8c8ff';
        c.fillRect(22, 15, 1, 1);
        c.fillRect(22, 14, 1, 1);
        c.fillRect(23, 13, 1, 1);
        c.fillRect(23, 12, 1, 1);
        c.fillRect(24, 11, 1, 1);
        c.fillRect(24, 10, 1, 1);
        // Feather plume
        c.fillStyle = '#f4ecd8';
        c.fillRect(25, 9, 1, 2);
        c.fillRect(26, 8, 1, 3);
        c.fillRect(25, 7, 2, 1);
      },
    });
  }

  _paintPracticeBuddy(ctx) {
    // Cheerful chibi guide: bright yellow hood, pink shirt, star badge.
    this._paintChibiNPC(ctx, {
      hair: '#d8a000',
      hairHi: '#ffe040',
      robe: '#ff5090',
      robeHi: '#ff80b0',
      robeTrim: '#ffe040',
      eyes: '#1a1a2e',
      prop: (c) => {
        // Pink star badge on the chest
        c.fillStyle = '#ff1493';
        c.fillRect(15, 17, 2, 1);
        c.fillRect(14, 18, 4, 1);
        c.fillRect(13, 19, 2, 1);
        c.fillRect(17, 19, 2, 1);
        c.fillStyle = '#ffe040';
        c.fillRect(15, 18, 2, 1);
      },
    });
  }

  _paintMirrorSprite(ctx) {
    // Chibi water sprite: light blue hood and robe with a teardrop emblem.
    this._paintChibiNPC(ctx, {
      hair: '#5080a8',
      hairHi: '#88b0d8',
      robe: '#88b0d8',
      robeHi: '#d0e8ff',
      robeTrim: '#284060',
      eyes: '#1a3050',
      prop: (c) => {
        // Teardrop on chest
        c.fillStyle = '#d0e8ff';
        c.fillRect(16, 17, 1, 1);
        c.fillRect(15, 18, 3, 1);
        c.fillRect(16, 19, 1, 1);
        c.fillStyle = '#ffffff';
        c.fillRect(15, 18, 1, 1);
      },
    });
  }

  _paintPixelSnake(ctx) {
    // Small coiled garden snake — green body with diamond markings,
    // a wedge-shaped head and a forked tongue. Used as the level-2
    // boss; renders inside a single 32x32 NPC frame.
    const ts = this._ts;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(ts / 2, ts - 3, 11, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer coil (dark green)
    ctx.fillStyle = '#3f6d29';
    ctx.beginPath();
    ctx.arc(ts / 2, ts / 2 + 2, 11, 0, Math.PI * 2);
    ctx.fill();

    // Mid coil (mid green)
    ctx.fillStyle = '#5a8d3a';
    ctx.beginPath();
    ctx.arc(ts / 2, ts / 2 + 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Inner coil (light green) — pale belly
    ctx.fillStyle = '#8fc25a';
    ctx.beginPath();
    ctx.arc(ts / 2, ts / 2 + 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Diamond markings along the back
    ctx.fillStyle = '#2a4a1b';
    const diamonds = [
      [ts / 2 - 8, ts / 2 + 1],
      [ts / 2 - 5, ts / 2 - 4],
      [ts / 2 - 3, ts / 2 + 6],
      [ts / 2 + 4, ts / 2 + 6],
    ];
    diamonds.forEach(([dx, dy]) => {
      ctx.fillRect(dx, dy, 2, 2);
    });

    // Head — wedge sticking out to the right
    ctx.fillStyle = '#5a8d3a';
    ctx.fillRect(ts / 2 + 6, ts / 2 - 5, 8, 7);
    ctx.fillStyle = '#7eb84d';
    ctx.fillRect(ts / 2 + 6, ts / 2 - 5, 8, 2);

    // Eyes
    ctx.fillStyle = '#fff7c0';
    ctx.fillRect(ts / 2 + 8, ts / 2 - 3, 2, 2);
    ctx.fillRect(ts / 2 + 12, ts / 2 - 3, 1, 2);
    ctx.fillStyle = '#1c1108';
    ctx.fillRect(ts / 2 + 9, ts / 2 - 2, 1, 1);

    // Forked tongue
    ctx.fillStyle = '#d54040';
    ctx.fillRect(ts / 2 + 14, ts / 2, 2, 1);
    ctx.fillRect(ts / 2 + 15, ts / 2 - 1, 1, 1);
    ctx.fillRect(ts / 2 + 15, ts / 2 + 1, 1, 1);
  }
}
