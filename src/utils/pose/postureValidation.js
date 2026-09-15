import { getExerciseValidationRule, LANDMARK_INDEX, POSTURE_VALIDATION_CONFIG } from './exerciseValidationRules';

const visible = (landmarks, name, minConfidence) => {
  const landmark = landmarks?.[LANDMARK_INDEX[name]];
  return !!landmark && !landmark.backfilled && (landmark.visibility ?? 0) >= minConfidence;
};

const center = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const angleBetween = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
};

const get = (landmarks, name) => landmarks?.[LANDMARK_INDEX[name]];

const evaluateStartingPose = (landmarks, mode, rule, helpers = {}) => {
  const family = rule.family;
  if (family === 'pushup') {
    const inStart = helpers.isPushupStartPose ? helpers.isPushupStartPose(landmarks) : false;
    return {
      ready: inStart,
      valid: inStart,
      reason: inStart ? 'pushup_start_ready' : 'pushup_start_not_ready',
      feedback: inStart ? (rule.readyMessage || 'Ready position detected') : (rule.invalidMessages?.starting || 'Adjust your starting position')
    };
  }

  if (family === 'plank') {
    const alignment = helpers.checkBackAlignment ? helpers.checkBackAlignment(landmarks, { exerciseMode: mode }) : { isValid: false };
    return {
      ready: !!alignment.isValid,
      valid: !!alignment.isValid,
      reason: alignment.reason || (alignment.isValid ? 'plank_ready' : 'plank_not_ready'),
      feedback: alignment.feedback || (alignment.isValid ? (rule.readyMessage || 'Ready position detected') : (rule.invalidMessages?.alignment || 'Keep your back straight'))
    };
  }

  if (family === 'squat') {
    const lh = get(landmarks, 'leftHip');
    const rh = get(landmarks, 'rightHip');
    const lk = get(landmarks, 'leftKnee');
    const rk = get(landmarks, 'rightKnee');
    const ls = get(landmarks, 'leftShoulder');
    const rs = get(landmarks, 'rightShoulder');
    const hip = center(lh, rh);
    const knee = center(lk, rk);
    const shoulder = center(ls, rs);
    const torsoTilt = Math.min(angleBetween(shoulder, hip), Math.abs(180 - angleBetween(shoulder, hip)));
    const standing = hip.y < knee.y - 0.03 && torsoTilt > 45;
    return {
      ready: standing,
      valid: standing,
      reason: standing ? 'standing_ready' : 'standing_not_ready',
      feedback: standing ? (rule.readyMessage || 'Ready position detected') : (rule.invalidMessages?.starting || 'Stand upright and hold still')
    };
  }

  if (family === 'wallsit') {
    const lh = get(landmarks, 'leftHip');
    const rh = get(landmarks, 'rightHip');
    const lk = get(landmarks, 'leftKnee');
    const rk = get(landmarks, 'rightKnee');
    const la = get(landmarks, 'leftAnkle');
    const ra = get(landmarks, 'rightAnkle');
    const angle = helpers.calculateAngle;
    const leftKnee = angle ? angle(lh, lk, la) : 180;
    const rightKnee = angle ? angle(rh, rk, ra) : 180;
    const bent = Number.isFinite(leftKnee) && Number.isFinite(rightKnee)
      && leftKnee >= 80 && leftKnee <= 150
      && rightKnee >= 80 && rightKnee <= 150;
    return {
      ready: bent,
      valid: bent,
      reason: bent ? 'wallsit_ready' : 'wallsit_not_ready',
      feedback: bent ? (rule.readyMessage || 'Ready position detected') : (rule.invalidMessages?.starting || 'Adjust your knees')
    };
  }

  return {
    ready: true,
    valid: true,
    reason: 'general_ready',
    feedback: rule.readyMessage || 'Ready position detected'
  };
};

export const evaluatePostureFrame = (landmarks, mode, helpers = {}, config = {}) => {
  const mergedConfig = { ...POSTURE_VALIDATION_CONFIG, ...config };
  const rule = getExerciseValidationRule(mode);

  if (!landmarks?.length) {
    return {
      hasPose: false,
      isValid: false,
      isReadyPose: false,
      requiredVisible: false,
      confidence: 0,
      reason: 'no_landmarks',
      feedback: 'Move back so your full body is visible',
      rule
    };
  }

  const required = rule.requiredJoints || [];
  const visibleCount = required.filter(name => visible(landmarks, name, mergedConfig.MIN_KEYPOINT_CONFIDENCE)).length;
  const confidence = required.length ? visibleCount / required.length : 1;
  const requiredVisible = required.length ? visibleCount >= Math.ceil(required.length * 0.75) : true;

  if (!requiredVisible) {
    return {
      hasPose: true,
      isValid: false,
      isReadyPose: false,
      requiredVisible: false,
      confidence,
      reason: 'required_joints_missing',
      feedback: rule.invalidMessages?.visibility || 'Move back so your full body is visible',
      rule
    };
  }

  const start = evaluateStartingPose(landmarks, mode, rule, helpers);
  return {
    hasPose: true,
    isValid: start.valid,
    isReadyPose: start.ready,
    requiredVisible: true,
    confidence,
    reason: start.reason,
    feedback: start.feedback,
    rule
  };
};
