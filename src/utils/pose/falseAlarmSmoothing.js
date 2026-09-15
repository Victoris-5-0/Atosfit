import { POSTURE_VALIDATION_CONFIG } from './exerciseValidationRules';

export class FalseAlarmSmoother {
  constructor(config = {}) {
    this.config = { ...POSTURE_VALIDATION_CONFIG, ...config };
    this.reset();
  }

  reset() {
    this.validFrames = 0;
    this.invalidFrames = 0;
    this.readyFrames = 0;
    this.lostFrames = 0;
    this.stablePosture = 'unknown';
    this.lastReason = 'detecting';
  }

  update({ hasPose, isValid, isReadyPose, reason }) {
    if (!hasPose) {
      this.lostFrames += 1;
      this.validFrames = 0;
      this.readyFrames = 0;
      if (this.lostFrames >= this.config.LOST_TRACKING_FRAMES_LIMIT) {
        this.stablePosture = 'unknown';
      }
      this.lastReason = reason || 'no_landmarks';
      return this.snapshot();
    }

    this.lostFrames = 0;

    if (isValid) {
      this.validFrames += 1;
      this.invalidFrames = 0;
      if (this.validFrames >= this.config.VALID_FRAMES_REQUIRED) {
        this.stablePosture = 'correct';
      }
    } else {
      this.invalidFrames += 1;
      this.validFrames = 0;
      if (this.invalidFrames >= this.config.INVALID_FRAMES_REQUIRED) {
        this.stablePosture = 'incorrect';
      }
    }

    this.readyFrames = isReadyPose ? this.readyFrames + 1 : 0;
    this.lastReason = reason || (isValid ? 'valid' : 'invalid');
    return this.snapshot();
  }

  snapshot() {
    return {
      stablePosture: this.stablePosture,
      validFrames: this.validFrames,
      invalidFrames: this.invalidFrames,
      readyFrames: this.readyFrames,
      lostFrames: this.lostFrames,
      reason: this.lastReason,
      readyStable: this.readyFrames >= this.config.READY_FRAMES_REQUIRED
    };
  }
}
