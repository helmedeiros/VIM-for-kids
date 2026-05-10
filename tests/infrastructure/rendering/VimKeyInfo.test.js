import { VimKeyInfo } from '../../../src/infrastructure/rendering/VimKeyInfo.js';

describe('VimKeyInfo', () => {
  describe('get', () => {
    it('returns info for known keys', () => {
      const info = VimKeyInfo.get('h');
      expect(info.category).toBe('Movement');
      expect(info.desc).toContain('LEFT');
    });

    it('returns info for all movement keys', () => {
      ['h', 'j', 'k', 'l'].forEach((key) => {
        const info = VimKeyInfo.get(key);
        expect(info.category).toBe('Movement');
        expect(info.desc).toBeTruthy();
      });
    });

    it('returns before/after for movement keys', () => {
      const info = VimKeyInfo.get('j');
      expect(info.before).toBeTruthy();
      expect(info.after).toBeTruthy();
    });

    it('returns example for word jump keys', () => {
      const info = VimKeyInfo.get('w');
      expect(info.category).toBe('Word Jump');
      expect(info.example).toBeTruthy();
    });

    it('returns fallback for unknown keys', () => {
      const info = VimKeyInfo.get('unknown');
      expect(info.category).toBe('VIM');
      expect(info.desc).toContain('unknown');
    });
  });

  describe('_buildOverlay', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('creates overlay element with correct id', () => {
      const overlay = VimKeyInfo._buildOverlay({
        category: 'Test',
        badge: 'x',
        title: 'Title',
        desc: 'Desc',
      });
      expect(overlay.id).toBe('vimKeyExplanation');
      expect(overlay.className).toContain('vim-key-overlay');
    });

    it('includes category, badge, title, desc', () => {
      const overlay = VimKeyInfo._buildOverlay({
        category: 'Movement',
        badge: 'h',
        title: 'New Key!',
        desc: 'Moves left',
      });
      expect(overlay.innerHTML).toContain('Movement');
      expect(overlay.innerHTML).toContain('h');
      expect(overlay.innerHTML).toContain('New Key!');
      expect(overlay.innerHTML).toContain('Moves left');
    });

    it('includes example when provided', () => {
      const overlay = VimKeyInfo._buildOverlay({
        category: 'Test',
        badge: 'w',
        title: 'Title',
        desc: 'Desc',
        exampleLabel: 'Example',
        exampleText: 'press w',
      });
      expect(overlay.innerHTML).toContain('press w');
    });

    it('includes before/after columns when provided', () => {
      const overlay = VimKeyInfo._buildOverlay({
        category: 'Test',
        badge: 'j',
        title: 'Title',
        desc: 'Desc',
        before: 'A [*] C',
        after: 'A B [*]',
      });
      expect(overlay.innerHTML).toContain('Before');
      expect(overlay.innerHTML).toContain('After');
      expect(overlay.innerHTML).toContain('A [*] C');
    });

    it('includes dismiss hint', () => {
      const overlay = VimKeyInfo._buildOverlay({
        category: 'Test',
        badge: 'x',
        title: 'Title',
        desc: 'Desc',
      });
      expect(overlay.innerHTML).toContain('Press ESC to continue');
    });

    it('dismisses on click and calls onDismiss', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      const overlay = VimKeyInfo._buildOverlay(
        { category: 'Test', badge: 'x', title: 'T', desc: 'D' },
        { onDismiss }
      );
      document.body.appendChild(overlay);
      overlay.click();
      jest.advanceTimersByTime(300);
      expect(onDismiss).toHaveBeenCalled();
      expect(document.getElementById('vimKeyExplanation')).toBeNull();
    });

    it('dismisses on ESC key immediately', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      const overlay = VimKeyInfo._buildOverlay(
        { category: 'Test', badge: 'x', title: 'T', desc: 'D' },
        { delayAllKeys: 10000, onDismiss }
      );
      document.body.appendChild(overlay);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      jest.advanceTimersByTime(300);
      expect(onDismiss).toHaveBeenCalled();
    });

    it('ignores non-ESC keys before delay', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      const overlay = VimKeyInfo._buildOverlay(
        { category: 'Test', badge: 'x', title: 'T', desc: 'D' },
        { delayAllKeys: 10000, onDismiss }
      );
      document.body.appendChild(overlay);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('allows any key after delay expires', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      const overlay = VimKeyInfo._buildOverlay(
        { category: 'Test', badge: 'x', title: 'T', desc: 'D' },
        { delayAllKeys: 5000, onDismiss }
      );
      document.body.appendChild(overlay);
      jest.advanceTimersByTime(5000);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
      jest.advanceTimersByTime(300);
      expect(onDismiss).toHaveBeenCalled();
    });

    it('allows any key immediately when delayAllKeys is 0', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      const overlay = VimKeyInfo._buildOverlay(
        { category: 'Test', badge: 'x', title: 'T', desc: 'D' },
        { delayAllKeys: 0, onDismiss }
      );
      document.body.appendChild(overlay);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
      jest.advanceTimersByTime(300);
      expect(onDismiss).toHaveBeenCalled();
    });

    it('applies badge class when provided', () => {
      const overlay = VimKeyInfo._buildOverlay({
        category: 'Test',
        badge: 'X',
        badgeClass: 'vim-key-badge-gold',
        title: 'T',
        desc: 'D',
      });
      expect(overlay.innerHTML).toContain('vim-key-badge-gold');
    });

    it('omits example when not provided', () => {
      const overlay = VimKeyInfo._buildOverlay({
        category: 'Test',
        badge: 'x',
        title: 'T',
        desc: 'D',
      });
      expect(overlay.innerHTML).not.toContain('vim-key-example');
    });
  });

  describe('createOverlay', () => {
    it('creates overlay for a VIM key', () => {
      const overlay = VimKeyInfo.createOverlay({ key: 'h', description: '' });
      expect(overlay.innerHTML).toContain('Movement');
      expect(overlay.innerHTML).toContain('New Key Unlocked!');
    });
  });

  describe('createCollectibleIntroOverlay', () => {
    it('creates overlay for collectible key', () => {
      const overlay = VimKeyInfo.createCollectibleIntroOverlay({
        keyId: 'maze_key',
        name: 'Maze Key',
      });
      expect(overlay.innerHTML).toContain('Maze Key Found!');
      expect(overlay.innerHTML).toContain('Special Item');
      expect(overlay.innerHTML).toContain('How it works');
    });

    it('uses keyId as fallback name', () => {
      const overlay = VimKeyInfo.createCollectibleIntroOverlay({ keyId: 'test_key' });
      expect(overlay.innerHTML).toContain('test_key Found!');
    });
  });

  describe('createLockedGateOverlay', () => {
    it('creates overlay for main gate', () => {
      const overlay = VimKeyInfo.createLockedGateOverlay('main');
      expect(overlay.innerHTML).toContain('Gate is Locked!');
      expect(overlay.innerHTML).toContain('VIM letter keys');
      expect(overlay.innerHTML).toContain('What to do');
    });

    it('creates overlay for secondary gate', () => {
      const overlay = VimKeyInfo.createLockedGateOverlay('secondary');
      expect(overlay.innerHTML).toContain('Door is Locked!');
      expect(overlay.innerHTML).toContain('special key');
    });
  });

  describe('createLevelCompleteOverlay', () => {
    it('creates overlay for level completion', () => {
      const overlay = VimKeyInfo.createLevelCompleteOverlay('level_2');
      expect(overlay.innerHTML).toContain('Amazing job!');
      expect(overlay.innerHTML).toContain('Level 2');
      expect(overlay.innerHTML).toContain('Level Complete');
    });
  });

  describe('updateHelpKeys', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="helpCollectedKeys"></div>';
    });

    it('shows base keys with locked state when none collected', () => {
      VimKeyInfo.updateHelpKeys(new Set(), jest.fn());
      const container = document.getElementById('helpCollectedKeys');
      const locked = container.querySelectorAll('.help-key-locked');
      expect(locked).toHaveLength(4);
    });

    it('unlocks collected keys', () => {
      VimKeyInfo.updateHelpKeys(new Set(['h', 'j']), jest.fn());
      const container = document.getElementById('helpCollectedKeys');
      const clickable = container.querySelectorAll('.help-key.clickable');
      const locked = container.querySelectorAll('.help-key-locked');
      expect(clickable).toHaveLength(2);
      expect(locked).toHaveLength(2);
    });

    it('adds extra keys below divider', () => {
      VimKeyInfo.updateHelpKeys(new Set(['h', 'j', 'k', 'l', 'w']), jest.fn());
      const container = document.getElementById('helpCollectedKeys');
      const divider = container.querySelector('.help-keys-divider');
      expect(divider).not.toBeNull();
      // 4 base + divider + 1 extra = 6 children
      expect(container.children.length).toBe(6);
    });

    it('does nothing if container missing', () => {
      document.body.innerHTML = '';
      expect(() => VimKeyInfo.updateHelpKeys(new Set(['h']), jest.fn())).not.toThrow();
    });
  });
});
