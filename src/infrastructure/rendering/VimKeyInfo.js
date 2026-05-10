/**
 * Kid-friendly VIM key explanations and shared overlay card builder.
 * Single source of truth for all explanation cards used by both renderers.
 */
export class VimKeyInfo {
  static get(key) {
    const info = VimKeyInfo._data[key];
    if (!info) return { category: 'VIM', desc: `The ${key} key`, example: null, before: null, after: null };
    return info;
  }

  // ── Overlay factory (single reusable builder) ──

  /**
   * Build a card overlay from a content descriptor.
   * @param {Object} content - { category, badge, badgeClass, title, desc, exampleLabel, exampleText, before, after }
   * @param {Object} options - { delayAllKeys: number (ms), onDismiss: Function }
   * @returns {HTMLElement}
   */
  static _buildOverlay(content, options = {}) {
    const { delayAllKeys = 0, onDismiss = null } = options;

    const overlay = document.createElement('div');
    overlay.id = 'vimKeyExplanation';
    overlay.className = 'vim-key-overlay';

    let exampleHtml = '';
    if (content.before && content.after) {
      exampleHtml = `<div class="vim-key-example vim-key-example-columns">
        <div class="vim-key-example-col"><div class="vim-key-example-label">Before</div><div class="vim-key-example-text">${content.before}</div></div>
        <div class="vim-key-example-arrow">\u2192</div>
        <div class="vim-key-example-col"><div class="vim-key-example-label">After</div><div class="vim-key-example-text">${content.after}</div></div>
      </div>`;
    } else if (content.exampleText) {
      exampleHtml = `<div class="vim-key-example"><div class="vim-key-example-label">${content.exampleLabel || 'Example'}</div><div class="vim-key-example-text">${content.exampleText}</div></div>`;
    }

    const card = document.createElement('div');
    card.className = 'vim-key-card';
    card.innerHTML = `
      <div class="vim-key-category">${content.category}</div>
      <div class="vim-key-badge ${content.badgeClass || ''}">${content.badge}</div>
      <div class="vim-key-title">${content.title}</div>
      <div class="vim-key-desc">${content.desc}</div>
      ${exampleHtml}
      <div class="vim-key-hint">Press ESC to continue</div>
    `;
    overlay.appendChild(card);

    // Dismiss logic: ESC/click always, other keys after delay
    let allowAllKeys = delayAllKeys <= 0;
    const timer = delayAllKeys > 0 ? setTimeout(() => { allowAllKeys = true; }, delayAllKeys) : null;

    const dismiss = () => {
      if (timer) clearTimeout(timer);
      overlay.classList.add('vim-key-dismissing');
      setTimeout(() => overlay.remove(), 300);
      document.removeEventListener('keydown', onKey);
      if (onDismiss) onDismiss();
    };
    const onKey = (e) => {
      if (e.key === 'Escape' || allowAllKeys) { e.preventDefault(); dismiss(); }
    };
    overlay.addEventListener('click', dismiss);
    document.addEventListener('keydown', onKey);

    return overlay;
  }

  // ── Public overlay creators (thin wrappers over _buildOverlay) ──

  static createOverlay(vimKey, onDismiss) {
    const info = VimKeyInfo.get(vimKey.key);
    return VimKeyInfo._buildOverlay({
      category: info.category,
      badge: vimKey.key,
      title: 'New Key Unlocked!',
      desc: info.desc,
      before: info.before,
      after: info.after,
      exampleLabel: 'Example',
      exampleText: info.example,
    }, { delayAllKeys: 10000, onDismiss });
  }

  static createCollectibleIntroOverlay(collectibleKey, onDismiss) {
    const name = collectibleKey.name || collectibleKey.keyId || 'Special Key';
    return VimKeyInfo._buildOverlay({
      category: 'Special Item',
      badge: '\uD83D\uDD11',
      badgeClass: 'vim-key-badge-gold',
      title: `${name} Found!`,
      desc: 'You found a special key! These keys open locked doors that block your path. Check your <strong>Key Inventory</strong> at the bottom of the screen!',
      exampleLabel: 'How it works',
      exampleText: 'Find key \u2192 Walk to locked door \u2192 Door opens!',
    }, { delayAllKeys: 10000, onDismiss });
  }

  static createLockedGateOverlay(gateType, onDismiss) {
    const isMain = gateType === 'main';
    return VimKeyInfo._buildOverlay({
      category: isMain ? 'Locked Gate' : 'Locked Door',
      badge: '\uD83D\uDD12',
      badgeClass: 'vim-key-badge-locked',
      title: isMain ? 'Gate is Locked!' : 'Door is Locked!',
      desc: isMain
        ? 'This gate needs <strong>all the VIM letter keys</strong> to open. Look around the map for letters like h, j, k, l!'
        : 'This door needs a <strong>special key</strong> to open. Explore the area and look for a shiny key!',
      exampleLabel: 'What to do',
      exampleText: isMain
        ? 'Explore the map \u2192 Collect all letter keys \u2192 Gate opens!'
        : 'Look around \u2192 Find the special key \u2192 Walk to this door \u2192 It opens!',
    }, { delayAllKeys: 5000, onDismiss });
  }

  static createLevelCompleteOverlay(nextLevelId, onDismiss) {
    const levelNum = nextLevelId.replace('level_', '');
    return VimKeyInfo._buildOverlay({
      category: 'Level Complete',
      badge: '\u2B50',
      badgeClass: 'vim-key-badge-gold',
      title: 'Amazing job!',
      desc: `You completed this level! Get ready for <strong>Level ${levelNum}</strong> — new challenges await!`,
      exampleLabel: 'What happens next',
      exampleText: 'New area \u2192 New keys to find \u2192 New skills to learn!',
    }, { delayAllKeys: 0, onDismiss });
  }

  // ── Help modal key list ──

  static _baseKeys = [
    { key: 'h', label: 'Left' },
    { key: 'j', label: 'Down' },
    { key: 'k', label: 'Up' },
    { key: 'l', label: 'Right' },
  ];

  static updateHelpKeys(collectedKeys, onKeyClick) {
    const container = document.getElementById('helpCollectedKeys');
    if (!container) return;
    container.innerHTML = '';

    const openKey = (keyName) => {
      const helpModal = document.getElementById('helpModal');
      if (helpModal) helpModal.classList.add('hidden');
      onKeyClick({ key: keyName, description: '' });
    };

    VimKeyInfo._baseKeys.forEach(({ key, label }) => {
      const collected = collectedKeys.has(key);
      const row = document.createElement('div');
      row.className = 'help-key-row';

      const badge = document.createElement('span');
      badge.className = collected ? 'help-key clickable' : 'help-key help-key-locked';
      badge.textContent = key;
      if (collected) badge.addEventListener('click', () => openKey(key));

      const desc = document.createElement('span');
      desc.className = 'help-key-label';
      desc.textContent = label;

      row.appendChild(badge);
      row.appendChild(desc);
      container.appendChild(row);
    });

    const baseSet = new Set(VimKeyInfo._baseKeys.map((b) => b.key));
    const extras = [...collectedKeys].filter((k) => !baseSet.has(k));

    if (extras.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'help-keys-divider';
      container.appendChild(divider);

      extras.forEach((keyName) => {
        const info = VimKeyInfo.get(keyName);
        const row = document.createElement('div');
        row.className = 'help-key-row';

        const badge = document.createElement('span');
        badge.className = 'help-key clickable';
        badge.textContent = keyName;
        badge.addEventListener('click', () => openKey(keyName));

        const desc = document.createElement('span');
        desc.className = 'help-key-label';
        desc.textContent = info.shortLabel || info.desc.split('.')[0];

        row.appendChild(badge);
        row.appendChild(desc);
        container.appendChild(row);
      });
    }
  }

  // ── Key data ──

  static _data = {
    h: {
      category: 'Movement',
      desc: 'Moves your character one step to the LEFT.',
      before: 'A B [*] D',
      after: 'A [*] C D',
    },
    j: {
      category: 'Movement',
      desc: 'Moves your character one step DOWN.',
      before: 'A [*] C\nD  E  F\nG  H  I',
      after: 'A  B  C\nD [*] F\nG  H  I',
    },
    k: {
      category: 'Movement',
      desc: 'Moves your character one step UP.',
      before: 'A  B  C\nD  E  F\nG [*] I',
      after: 'A  B  C\nD [*] F\nG  H  I',
    },
    l: {
      category: 'Movement',
      desc: 'Moves your character one step to the RIGHT.',
      before: 'A [*] C D',
      after: 'A B [*] D',
    },
    w: {
      category: 'Word Jump',
      desc: 'Jumps your character forward to the START of the next word.',
      shortLabel: 'Jump forward',
      example: 'the [c]at sat \u2192 press w \u2192 the cat [s]at',
    },
    W: {
      category: 'Big Word Jump',
      desc: 'Like w, but your character jumps over everything until the next space!',
      example: 'hello-[w]orld foo \u2192 press W \u2192 hello-world [f]oo',
    },
    e: {
      category: 'Word Jump',
      desc: 'Jumps your character to the END of the current or next word.',
      shortLabel: 'Jump end',
      example: '[t]he cat \u2192 press e \u2192 th[e] cat',
    },
    E: {
      category: 'Big Word Jump',
      desc: 'Like e, but jumps to the end of a big group of letters.',
      example: '[h]ello-world \u2192 press E \u2192 hello-worl[d]',
    },
    b: {
      category: 'Word Jump',
      desc: 'Jumps your character BACK to the start of the previous word.',
      shortLabel: 'Jump back',
      example: 'the ca[t] \u2192 press b \u2192 the [c]at',
    },
    B: {
      category: 'Big Word Jump',
      desc: 'Like b, but jumps back over a whole big group of letters.',
      example: 'hello worl[d]-end \u2192 press B \u2192 hello [w]orld-end',
    },
    i: {
      category: 'Mode',
      desc: 'Enters INSERT mode so you can type and add text. Press ESC to go back!',
      example: 'press i \u2192 now you can type! \u2192 press ESC to stop typing',
    },
    ESC: {
      category: 'Mode',
      desc: 'Goes back to NORMAL mode. Your safe home where you can move around!',
      example: 'Typing... \u2192 press ESC \u2192 back to moving around!',
    },
    ':': {
      category: 'Command',
      desc: 'Opens the COMMAND box. Type special commands like :w to save your work!',
      example: 'press : \u2192 type a command \u2192 press Enter',
    },
    x: {
      category: 'Delete',
      desc: 'Erases the letter right under your character. Like a tiny eraser!',
      example: 'He[l]lo \u2192 press x \u2192 Helo (the l is gone!)',
    },
    d: {
      category: 'Delete',
      desc: 'The delete power! Use it with other keys: dw erases a word, dd erases a whole row.',
      example: 'press dd \u2192 the whole row disappears!',
    },
    a: {
      category: 'Insert',
      desc: 'Like i, but starts typing AFTER your character instead of before.',
      example: 'Hel[l]o \u2192 press a \u2192 you type after the l',
    },
    o: {
      category: 'Insert',
      desc: 'Creates an empty space below and lets you start typing there!',
      example: 'Hello \u2192 press o \u2192 Hello (new space below to type in)',
    },
    O: {
      category: 'Insert',
      desc: 'Creates an empty space above and lets you start typing there!',
      example: 'Hello \u2192 press O \u2192 (new space above) Hello',
    },
    yy: {
      category: 'Copy & Paste',
      desc: 'COPIES a row of text. Then press p to paste it somewhere else!',
      example: 'Hello \u2192 press yy \u2192 copied! \u2192 press p \u2192 Hello Hello',
    },
    p: {
      category: 'Copy & Paste',
      desc: 'PASTES whatever you copied. Places it right after your character!',
      example: 'After copying \u2192 press p \u2192 pasted below!',
    },
    P: {
      category: 'Copy & Paste',
      desc: 'PASTES above your character instead of below. Capital P = paste up!',
      example: 'After copying \u2192 press P \u2192 pasted above!',
    },
    '/': {
      category: 'Search',
      desc: 'Search for words! Type what you\'re looking for and press Enter.',
      example: 'press / \u2192 type "cat" \u2192 Enter \u2192 finds "cat"!',
    },
    '?': {
      category: 'Search',
      desc: 'Search BACKWARDS! Like / but looks toward the beginning.',
      example: 'press ? \u2192 type "dog" \u2192 Enter \u2192 finds "dog" above!',
    },
    n: {
      category: 'Search',
      desc: 'After searching, press n to find the NEXT match. Keep pressing for more!',
      example: 'Found "cat" \u2192 press n \u2192 next "cat" \u2192 press n \u2192 another!',
    },
    N: {
      category: 'Search',
      desc: 'Like n, but finds the PREVIOUS match instead. Goes backwards!',
      example: 'Found "cat" \u2192 press N \u2192 previous "cat"',
    },
  };
}
