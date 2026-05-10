/**
 * Port for audio playback.
 * Implementations handle sound effects and music.
 */
export class AudioPort {
  playSound(soundName) {
    // eslint-disable-line no-unused-vars
    throw new Error('AudioPort.playSound() must be implemented');
  }

  setVolume(volume) {
    // eslint-disable-line no-unused-vars
    throw new Error('AudioPort.setVolume() must be implemented');
  }

  isMuted() {
    throw new Error('AudioPort.isMuted() must be implemented');
  }

  toggleMute() {
    throw new Error('AudioPort.toggleMute() must be implemented');
  }
}
