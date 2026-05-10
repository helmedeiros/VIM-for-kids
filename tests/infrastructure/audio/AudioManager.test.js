import { AudioManager } from '../../../src/infrastructure/audio/AudioManager.js';

describe('AudioManager', () => {
  let manager;
  let mockOsc;
  let mockGain;
  let mockCtx;

  beforeEach(() => {
    mockOsc = {
      type: '',
      frequency: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };

    mockCtx = {
      currentTime: 0,
      state: 'running',
      resume: jest.fn(),
      destination: {},
      createOscillator: jest.fn().mockReturnValue(mockOsc),
      createGain: jest.fn().mockReturnValue(mockGain),
    };

    global.AudioContext = jest.fn().mockReturnValue(mockCtx);
    global.window = { AudioContext: global.AudioContext };

    manager = new AudioManager();
  });

  afterEach(() => {
    delete global.AudioContext;
  });

  describe('playSound', () => {
    it('plays move sound', () => {
      manager.playSound('move');
      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockOsc.start).toHaveBeenCalled();
    });

    it('plays collect chime', () => {
      manager.playSound('collect');
      // Chime plays 3 notes
      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('plays error sound', () => {
      manager.playSound('error');
      expect(mockOsc.type).toBe('square');
    });

    it('plays gate_open fanfare', () => {
      manager.playSound('gate_open');
      // Fanfare plays 4 notes
      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(4);
    });

    it('does nothing for unknown sound', () => {
      manager.playSound('unknown');
      expect(mockCtx.createOscillator).not.toHaveBeenCalled();
    });

    it('does nothing when muted', () => {
      manager.toggleMute();
      manager.playSound('move');
      expect(mockCtx.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe('setVolume', () => {
    it('sets volume', () => {
      manager.setVolume(0.8);
      expect(manager._volume).toBe(0.8);
    });

    it('clamps volume to 0-1', () => {
      manager.setVolume(2);
      expect(manager._volume).toBe(1);
      manager.setVolume(-1);
      expect(manager._volume).toBe(0);
    });
  });

  describe('isMuted', () => {
    it('returns false by default', () => {
      expect(manager.isMuted()).toBe(false);
    });

    it('returns true after muting', () => {
      manager.toggleMute();
      expect(manager.isMuted()).toBe(true);
    });
  });

  describe('toggleMute', () => {
    it('toggles mute state', () => {
      expect(manager.toggleMute()).toBe(true);
      expect(manager.toggleMute()).toBe(false);
    });
  });

  describe('_ensureContext', () => {
    it('resumes suspended context', () => {
      mockCtx.state = 'suspended';
      manager._ensureContext();
      expect(mockCtx.resume).toHaveBeenCalled();
    });
  });
});
