/**
 * Kid-friendly VIM key explanations with category, description, and example.
 * Also builds the shared DOM card used by both Canvas and DOM renderers.
 */
export class VimKeyInfo {
  static get(key) {
    const info = VimKeyInfo._data[key];
    if (!info) return { category: 'VIM', desc: `The ${key} key`, example: null, before: null, after: null };
    return info;
  }

  /**
   * Create the explanation overlay DOM structure.
   * @param {Object} vimKey - VimKey entity with .key and .description
   * @param {Function} onDismiss - called when user dismisses the card
   * @returns {HTMLElement} the overlay element (caller appends to DOM)
   */
  static createOverlay(vimKey, onDismiss) {
    const info = VimKeyInfo.get(vimKey.key);

    const overlay = document.createElement('div');
    overlay.id = 'vimKeyExplanation';
    overlay.className = 'vim-key-overlay';

    const card = document.createElement('div');
    card.className = 'vim-key-card';

    let exampleHtml = '';
    if (info.before && info.after) {
      exampleHtml = `<div class="vim-key-example vim-key-example-columns">
        <div class="vim-key-example-col">
          <div class="vim-key-example-label">Before</div>
          <div class="vim-key-example-text">${info.before}</div>
        </div>
        <div class="vim-key-example-arrow">\u2192</div>
        <div class="vim-key-example-col">
          <div class="vim-key-example-label">After</div>
          <div class="vim-key-example-text">${info.after}</div>
        </div>
      </div>`;
    } else if (info.example) {
      exampleHtml = `<div class="vim-key-example"><div class="vim-key-example-label">Example</div><div class="vim-key-example-text">${info.example}</div></div>`;
    }

    card.innerHTML = `
      <div class="vim-key-category">${info.category}</div>
      <div class="vim-key-badge">${vimKey.key}</div>
      <div class="vim-key-title">New Key Unlocked!</div>
      <div class="vim-key-desc">${info.desc}</div>
      ${exampleHtml}
      <div class="vim-key-hint">Press ESC to continue</div>
    `;

    overlay.appendChild(card);

    // Dismiss: ESC or click immediately, any key after 10s
    let allowAllKeys = false;
    const timer = setTimeout(() => {
      allowAllKeys = true;
    }, 10000);

    const dismiss = () => {
      clearTimeout(timer);
      overlay.classList.add('vim-key-dismissing');
      setTimeout(() => overlay.remove(), 300);
      document.removeEventListener('keydown', onKey);
      if (onDismiss) onDismiss();
    };

    const onKey = (e) => {
      if (e.key === 'Escape' || allowAllKeys) {
        e.preventDefault();
        dismiss();
      }
    };

    overlay.addEventListener('click', dismiss);
    document.addEventListener('keydown', onKey);

    return overlay;
  }

  /**
   * Update the "Your Keys" section in the help modal with collected keys.
   * Each key badge is clickable to re-open its explanation.
   * @param {Set<string>} collectedKeys
   * @param {Function} onKeyClick - called with a vimKey-like object when a key is clicked
   */
  static updateHelpKeys(collectedKeys, onKeyClick) {
    const staticSection = document.getElementById('helpKeysStatic');
    const dynamicSection = document.getElementById('helpCollectedKeys');
    const title = document.getElementById('helpKeysTitle');
    const clickHint = document.getElementById('helpKeysClickHint');
    if (!dynamicSection) return;

    if (collectedKeys.size === 0) {
      // Show static "How to Move" guide
      if (staticSection) staticSection.style.display = '';
      dynamicSection.style.display = 'none';
      if (clickHint) clickHint.style.display = 'none';
      if (title) title.textContent = 'How to Move';
      return;
    }

    // Switch to dynamic collected keys
    if (staticSection) staticSection.style.display = 'none';
    dynamicSection.style.display = '';
    if (clickHint) clickHint.style.display = '';
    if (title) title.textContent = 'Your Keys';
    dynamicSection.innerHTML = '';

    collectedKeys.forEach((keyName) => {
      const info = VimKeyInfo.get(keyName);
      const el = document.createElement('div');
      el.className = 'collected-key clickable';
      el.textContent = keyName;
      el.title = `${info.desc}`;
      el.addEventListener('click', () => {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) helpModal.classList.add('hidden');
        onKeyClick({ key: keyName, description: '' });
      });
      dynamicSection.appendChild(el);
    });
  }

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
      desc: 'Your character jumps forward to the START of the next word. Super fast!',
      example: 'the [c]at sat \u2192 press w \u2192 the cat [s]at',
    },
    W: {
      category: 'Big Word Jump',
      desc: 'Like w, but your character jumps over everything until the next space!',
      example: 'hello-[w]orld foo \u2192 press W \u2192 hello-world [f]oo',
    },
    e: {
      category: 'Word Jump',
      desc: 'Your character jumps to the END of the current or next word.',
      example: '[t]he cat \u2192 press e \u2192 th[e] cat',
    },
    E: {
      category: 'Big Word Jump',
      desc: 'Like e, but jumps to the end of a big group of letters.',
      example: '[h]ello-world \u2192 press E \u2192 hello-worl[d]',
    },
    b: {
      category: 'Word Jump',
      desc: 'Your character jumps BACK to the start of the previous word!',
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
