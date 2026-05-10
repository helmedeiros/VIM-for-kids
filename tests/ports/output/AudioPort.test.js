import { AudioPort } from '../../../src/ports/output/AudioPort.js';

describe('AudioPort', () => {
  let port;

  beforeEach(() => {
    port = new AudioPort();
  });

  it('throws on playSound', () => {
    expect(() => port.playSound('move')).toThrow('must be implemented');
  });

  it('throws on setVolume', () => {
    expect(() => port.setVolume(0.5)).toThrow('must be implemented');
  });

  it('throws on isMuted', () => {
    expect(() => port.isMuted()).toThrow('must be implemented');
  });

  it('throws on toggleMute', () => {
    expect(() => port.toggleMute()).toThrow('must be implemented');
  });
});
