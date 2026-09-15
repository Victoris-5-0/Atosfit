const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const buildDashboardCoachPulse = ({ mission, water = 0, waterGoal = 2500 } = {}) => {
  const completed = toNumber(mission?.completedCount);
  const hydrationPct = waterGoal ? Math.round((water / waterGoal) * 100) : 0;

  if (completed >= 3) {
    return {
      tone: 'win',
      title: 'ATOS Coach',
      note: 'Clean day. Keep tomorrow simple: one focused workout, one useful scan, one small streak action.',
      actionLabel: 'Review missions',
    };
  }

  if (completed === 0) {
    return {
      tone: 'push',
      title: 'ATOS Coach',
      note: mission?.coachNote || 'Start with the smallest useful move: one guided set, then let the day build from there.',
      actionLabel: 'Start now',
    };
  }

  if (hydrationPct < 45) {
    return {
      tone: 'hydrate',
      title: 'ATOS Coach',
      note: 'You already moved the day forward. Add water before the next effort so your recovery does not lag behind.',
      actionLabel: '+250 ml',
    };
  }

  return {
    tone: 'steady',
    title: 'ATOS Coach',
    note: 'Good rhythm. Your next best step is the unfinished mission with the smallest friction.',
    actionLabel: 'Keep going',
  };
};

export const buildWorkoutCoachPulse = ({
  currentExercise,
  isWorkoutActive,
  isPaused,
  formScore = 0,
  repsCompleted = 0,
  postureStatus = 'unknown',
} = {}) => {
  const exercise = currentExercise?.name || 'this movement';
  const score = Math.round(toNumber(formScore));

  if (isPaused) {
    return {
      tone: 'steady',
      title: 'Coach Pulse',
      note: `Reset your breath, then resume ${exercise} with the cleanest rep you can repeat.`,
      actionLabel: 'Resume clean',
    };
  }

  if (isWorkoutActive && postureStatus === 'incorrect') {
    return {
      tone: 'warning',
      title: 'Coach Pulse',
      note: `Slow the next rep down. I am prioritizing form quality over extra ${exercise} volume right now.`,
      actionLabel: 'Fix form',
    };
  }

  if (isWorkoutActive && score >= 75) {
    return {
      tone: 'win',
      title: 'Coach Pulse',
      note: `Nice control. Hold this tempo for ${Math.max(2, 8 - Math.floor(repsCompleted / 4))} more reps before chasing speed.`,
      actionLabel: 'Stay steady',
    };
  }

  if (isWorkoutActive) {
    return {
      tone: 'push',
      title: 'Coach Pulse',
      note: `Build the set patiently. Make the next ${exercise} rep look like the one you would want replayed.`,
      actionLabel: 'Next rep',
    };
  }

  return {
    tone: 'steady',
    title: 'Coach Pulse',
    note: `Start ${exercise} when you are ready. I will watch for rhythm, reps, and form drift.`,
    actionLabel: 'Ready',
  };
};

export const buildFoodCoachPulse = ({ scanResult, recoveryMatch } = {}) => {
  if (!scanResult) {
    return {
      tone: 'steady',
      title: 'ATOS Coach',
      note: 'Scan the meal when the plate is clear in frame. I will connect it to today’s workout, not just count calories.',
      actionLabel: 'Awaiting scan',
    };
  }

  if (scanResult.errorMessage) {
    return {
      tone: 'warning',
      title: 'ATOS Coach',
      note: 'That scan did not produce reliable nutrition data, so I did not save it. Try a brighter, clearer food photo.',
      actionLabel: 'Try again',
    };
  }

  if (recoveryMatch?.score >= 70) {
    return {
      tone: 'win',
      title: 'ATOS Coach',
      note: `${scanResult.name} fits recovery well. You have enough signal here to count it as a useful post-workout meal.`,
      actionLabel: `${recoveryMatch.score}% fit`,
    };
  }

  if ((scanResult.protein || 0) < 20) {
    return {
      tone: 'push',
      title: 'ATOS Coach',
      note: 'Calories are not the whole story. Add a protein source to make this meal work harder for recovery.',
      actionLabel: 'Boost protein',
    };
  }

  return {
    tone: 'steady',
    title: 'ATOS Coach',
    note: `${scanResult.name} is logged. The next useful move is balancing the weakest macro against today’s workout.`,
    actionLabel: 'Meal linked',
  };
};
