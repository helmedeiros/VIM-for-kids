/**
 * Kid-friendly VIM key explanations with category, description, and example.
 * Also builds the shared DOM card used by both Canvas and DOM renderers.
 */
export class VimKeyInfo {
  static get(key) {
    const info = VimKeyInfo._data[key];
    if (!info) return { category: 'VIM', desc: `The ${key} key`, example: null };
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

    card.innerHTML = `
      <div class="vim-key-category">${info.category}</div>
      <div class="vim-key-badge">${vimKey.key}</div>
      <div class="vim-key-title">New Key Unlocked!</div>
      <div class="vim-key-desc">${info.desc}</div>
      ${info.example ? `<div class="vim-key-example"><div class="vim-key-example-label">Example</div><div class="vim-key-example-text">${info.example}</div></div>` : ''}
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

  static _data = {
    h: {
      category: 'Movement',
      desc: 'Moves your cursor one step to the LEFT. Think of it as the leftmost key in the row!',
      example: 'Hello World  \u2192  press h  \u2192  cursor moves left',
    },
    j: {
      category: 'Movement',
      desc: 'Moves your cursor one step DOWN. The j hangs below the line, just like going down!',
      example: 'Line 1\nLine 2  \u2192  press j  \u2192  cursor goes to Line 2',
    },
    k: {
      category: 'Movement',
      desc: 'Moves your cursor one step UP. The k points up, like climbing a mountain!',
      example: 'Line 1\nLine 2  \u2192  press k  \u2192  cursor goes to Line 1',
    },
    l: {
      category: 'Movement',
      desc: 'Moves your cursor one step to the RIGHT. It\'s the rightmost key in the row!',
      example: 'Hello World  \u2192  press l  \u2192  cursor moves right',
    },
    w: {
      category: 'Word Jump',
      desc: 'Jumps forward to the START of the next word. Super fast way to skip ahead!',
      example: 'the [c]at sat  \u2192  press w  \u2192  the cat [s]at',
    },
    W: {
      category: 'Big Word Jump',
      desc: 'Like w, but jumps over everything until the next space. Skips punctuation too!',
      example: 'hello-[w]orld foo  \u2192  press W  \u2192  hello-world [f]oo',
    },
    e: {
      category: 'Word Jump',
      desc: 'Jumps forward to the END of the current or next word.',
      example: '[t]he cat  \u2192  press e  \u2192  th[e] cat',
    },
    E: {
      category: 'Big Word Jump',
      desc: 'Like e, but jumps to the end of the big WORD (ignores punctuation).',
      example: '[h]ello-world  \u2192  press E  \u2192  hello-worl[d]',
    },
    b: {
      category: 'Word Jump',
      desc: 'Jumps BACK to the start of the previous word. Like w, but backwards!',
      example: 'the ca[t]  \u2192  press b  \u2192  the [c]at',
    },
    B: {
      category: 'Big Word Jump',
      desc: 'Like b, but jumps back over the whole big WORD.',
      example: 'hello worl[d]-end  \u2192  press B  \u2192  hello [w]orld-end',
    },
    i: {
      category: 'Mode',
      desc: 'Enters INSERT mode so you can type and add text. Press ESC to go back to normal!',
      example: 'Normal mode  \u2192  press i  \u2192  -- INSERT -- (now you can type!)',
    },
    ESC: {
      category: 'Mode',
      desc: 'Goes back to NORMAL mode. This is your safe home base where you can move around!',
      example: '-- INSERT --  \u2192  press ESC  \u2192  back to Normal mode',
    },
    ':': {
      category: 'Command',
      desc: 'Opens the COMMAND line at the bottom. Type commands like :w to save or :q to quit!',
      example: 'Normal mode  \u2192  press :  \u2192  :_  (type your command)',
    },
    x: {
      category: 'Delete',
      desc: 'Deletes the single character right under your cursor. Like a tiny eraser!',
      example: 'He[l]lo  \u2192  press x  \u2192  Helo',
    },
    d: {
      category: 'Delete',
      desc: 'The delete key! Combine it with movement keys: dw deletes a word, dd deletes a line.',
      example: 'press dd  \u2192  whole line deleted!',
    },
    a: {
      category: 'Insert',
      desc: 'Like i, but starts typing AFTER the cursor instead of before it.',
      example: 'Hel[l]o  \u2192  press a  \u2192  type after the l',
    },
    o: {
      category: 'Insert',
      desc: 'Creates a NEW LINE below and starts typing there. Super handy!',
      example: 'Line 1  \u2192  press o  \u2192  Line 1\\n[new empty line here]',
    },
    O: {
      category: 'Insert',
      desc: 'Creates a NEW LINE above and starts typing there. Like o, but upward!',
      example: 'Line 1  \u2192  press O  \u2192  [new empty line here]\\nLine 1',
    },
    yy: {
      category: 'Copy & Paste',
      desc: 'COPIES the whole line. Then press p to paste it! (yy = yank = copy)',
      example: 'Hello  \u2192  press yy  \u2192  line copied!  \u2192  press p  \u2192  Hello\\nHello',
    },
    p: {
      category: 'Copy & Paste',
      desc: 'PASTES whatever you copied or deleted. Put it right after your cursor!',
      example: 'After yy or dd  \u2192  press p  \u2192  pasted below!',
    },
    P: {
      category: 'Copy & Paste',
      desc: 'Pastes BEFORE the cursor instead of after. Capital P = paste above!',
      example: 'After yy  \u2192  press P  \u2192  pasted above!',
    },
    '/': {
      category: 'Search',
      desc: 'Search for text! Type what you\'re looking for and press Enter.',
      example: 'press /  \u2192  type "cat"  \u2192  Enter  \u2192  jumps to "cat"',
    },
    '?': {
      category: 'Search',
      desc: 'Search BACKWARDS! Like / but searches toward the beginning of the file.',
      example: 'press ?  \u2192  type "dog"  \u2192  Enter  \u2192  finds "dog" above',
    },
    n: {
      category: 'Search',
      desc: 'Jump to the NEXT match after a search. Keep pressing n to find more!',
      example: 'After /cat  \u2192  press n  \u2192  next "cat"  \u2192  press n  \u2192  next one!',
    },
    N: {
      category: 'Search',
      desc: 'Jump to the PREVIOUS match. Like n, but goes backwards!',
      example: 'After /cat  \u2192  press N  \u2192  previous "cat"',
    },
  };
}
