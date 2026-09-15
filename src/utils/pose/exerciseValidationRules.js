export const READINESS_STATES = {
  DETECTING_USER: 'DETECTING_USER',
  BODY_VISIBLE: 'BODY_VISIBLE',
  POSITION_NOT_READY: 'POSITION_NOT_READY',
  POSITION_READY: 'POSITION_READY',
  WORKOUT_ACTIVE: 'WORKOUT_ACTIVE',
  FORM_WARNING: 'FORM_WARNING',
  REP_COUNTING_PAUSED: 'REP_COUNTING_PAUSED',
  RESUME_WHEN_VALID: 'RESUME_WHEN_VALID'
};

export const POSTURE_VALIDATION_CONFIG = {
  MIN_KEYPOINT_CONFIDENCE: 0.5,
  VALID_FRAMES_REQUIRED: 4,
  INVALID_FRAMES_REQUIRED: 5,
  READY_FRAMES_REQUIRED: 8,
  LOST_TRACKING_FRAMES_LIMIT: 10
};

export const LANDMARK_INDEX = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28
};

const pushupJoints = [
  'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
  'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftKnee',
  'rightKnee'
];

export const EXERCISE_VALIDATION_RULES = {
  pushups: {
    family: 'pushup',
    requiredJoints: pushupJoints,
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the correct starting position',
    invalidMessages: {
      visibility: 'Move back so your full body is visible',
      alignment: 'Keep your body in one straight line',
      starting: 'Adjust your push-up starting position'
    }
  },
  widepushups: { family: 'pushup', requiredJoints: pushupJoints },
  narrowpushups: { family: 'pushup', requiredJoints: pushupJoints },
  diamondpushups: { family: 'pushup', requiredJoints: pushupJoints },
  kneepushups: {
    family: 'pushup',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip'],
    invalidMessages: { starting: 'Adjust your knee push-up starting position' }
  },
  squats: {
    family: 'squat',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    readyMessage: 'Ready position detected',
    waitingMessage: 'Stand upright and hold still',
    invalidMessages: {
      visibility: 'Move back so your shoulders, hips, and knees are visible',
      alignment: 'Stand facing the camera',
      starting: 'Adjust your standing starting position'
    }
  },
  lunges: {
    family: 'squat',
    requiredJoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
    waitingMessage: 'Set your feet and hold the starting position'
  },
  plank: {
    family: 'plank',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the correct plank position',
    invalidMessages: {
      visibility: 'Move back so your full body is visible',
      alignment: 'Keep your back straight',
      hipsHigh: 'Lower your hips slightly',
      hipsLow: 'Raise your hips slightly'
    }
  },
  sideplank: {
    family: 'plank',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftAnkle', 'rightAnkle'],
    waitingMessage: 'Hold the correct side plank position'
  },
  wallsit: {
    family: 'wallsit',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
    readyMessage: 'Ready position detected',
    waitingMessage: 'Bend your knees into the wall sit position',
    invalidMessages: {
      visibility: 'Move back so your legs are visible',
      starting: 'Adjust your knees',
      alignment: 'Hold a stable wall sit position'
    }
  },
  situps: {
    family: 'core',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    waitingMessage: 'Lie down in the starting position'
  },
  burpees: {
    family: 'general',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    waitingMessage: 'Stand facing the camera'
  },
  highknees: {
    family: 'cardio',
    requiredJoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    waitingMessage: 'Stand facing the camera'
  },
  jumpingjacks: {
    family: 'cardio',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    waitingMessage: 'Stand facing the camera'
  }
};

export const getExerciseValidationRule = (mode = 'pushups') => {
  const normalized = String(mode || 'pushups').toLowerCase().replace(/[^a-z0-9]+/g, '');
  return EXERCISE_VALIDATION_RULES[normalized] || EXERCISE_VALIDATION_RULES.pushups;
};
