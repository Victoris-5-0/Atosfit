import { FalseAlarmSmoother } from './falseAlarmSmoothing';
import { POSTURE_VALIDATION_CONFIG, READINESS_STATES } from './exerciseValidationRules';

export class ReadinessStateMachine {
  constructor(config = {}) {
    this.config = { ...POSTURE_VALIDATION_CONFIG, ...config };
    this.smoother = new FalseAlarmSmoother(this.config);
    this.reset();
  }

  reset() {
    this.state = READINESS_STATES.DETECTING_USER;
    this.hasStarted = false;
    this.paused = false;
    this.lastFeedback = 'Move back so your full body is visible';
    this.firstReadyTimestampSec = null;
    this.acceptedReps = 0;
    this.rejectedReps = 0;
    this.lastRejectedAt = 0;
    this.smoother.reset();
  }

  update(validation, timestampSec = null) {
    const previousState = this.state;
    const smooth = this.smoother.update(validation);
    const hasPose = !!validation.hasPose;
    const bodyVisible = hasPose && validation.requiredVisible;
    const stableValid = smooth.stablePosture === 'correct';
    const stableInvalid = smooth.stablePosture === 'incorrect';
    const readyStable = smooth.readyStable && stableValid;

    if (!hasPose) {
      this.state = READINESS_STATES.DETECTING_USER;
      this.paused = true;
    } else if (!bodyVisible) {
      this.state = READINESS_STATES.BODY_VISIBLE;
      this.paused = true;
    } else if (!this.hasStarted) {
      if (readyStable) {
        this.hasStarted = true;
        this.paused = false;
        this.state = READINESS_STATES.POSITION_READY;
        if (this.firstReadyTimestampSec == null && timestampSec != null) {
          this.firstReadyTimestampSec = timestampSec;
        }
      } else {
        this.paused = true;
        this.state = READINESS_STATES.POSITION_NOT_READY;
      }
    } else if (stableInvalid) {
      this.paused = true;
      this.state = READINESS_STATES.REP_COUNTING_PAUSED;
    } else if (stableValid) {
      this.paused = false;
      this.state = previousState === READINESS_STATES.REP_COUNTING_PAUSED
        ? READINESS_STATES.RESUME_WHEN_VALID
        : READINESS_STATES.WORKOUT_ACTIVE;
    } else {
      this.state = this.paused ? READINESS_STATES.FORM_WARNING : previousState;
    }

    this.lastFeedback = this.getFeedback(validation);
    return this.snapshot(previousState);
  }

  getFeedback(validation) {
    if (this.state === READINESS_STATES.DETECTING_USER) return 'Move back so your full body is visible';
    if (this.state === READINESS_STATES.BODY_VISIBLE) return validation.feedback || 'Make sure the required joints are visible';
    if (this.state === READINESS_STATES.POSITION_NOT_READY) return validation.feedback || 'Hold the correct starting position';
    if (this.state === READINESS_STATES.POSITION_READY) return 'Ready position detected';
    if (this.state === READINESS_STATES.REP_COUNTING_PAUSED) return validation.feedback || 'Counting paused until position is corrected';
    if (this.state === READINESS_STATES.RESUME_WHEN_VALID) return 'Counting resumed';
    if (this.state === READINESS_STATES.FORM_WARNING) return validation.feedback || 'Rep not counted - invalid posture';
    return validation.feedback || 'Workout active';
  }

  get canCount() {
    return this.hasStarted && !this.paused && (
      this.state === READINESS_STATES.POSITION_READY ||
      this.state === READINESS_STATES.WORKOUT_ACTIVE ||
      this.state === READINESS_STATES.RESUME_WHEN_VALID
    );
  }

  recordAcceptedRep() {
    this.acceptedReps += 1;
  }

  recordRejectedRep(timestampMs = Date.now()) {
    if (timestampMs - this.lastRejectedAt < 1200) return false;
    this.lastRejectedAt = timestampMs;
    this.rejectedReps += 1;
    return true;
  }

  snapshot(previousState = this.state) {
    const smooth = this.smoother.snapshot();
    return {
      state: this.state,
      previousState,
      postureStatus: smooth.stablePosture,
      feedback: this.lastFeedback,
      canCount: this.canCount,
      isPaused: this.paused,
      isReady: this.hasStarted,
      validFrames: smooth.validFrames,
      invalidFrames: smooth.invalidFrames,
      readyFrames: smooth.readyFrames,
      lostFrames: smooth.lostFrames,
      firstReadyTimestampSec: this.firstReadyTimestampSec,
      acceptedReps: this.acceptedReps,
      rejectedReps: this.rejectedReps
    };
  }
}
