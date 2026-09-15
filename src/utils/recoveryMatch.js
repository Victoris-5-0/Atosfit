const readJson = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const asNumber = (value) => Number(value) || 0;

const getMealMacro = (meal, keys) => {
  for (const key of keys) {
    if (meal?.[key] !== undefined && meal?.[key] !== null) return asNumber(meal[key]);
  }
  return 0;
};

const inferWorkoutFocus = (plan) => {
  const items = plan?.exercises || plan?.items || [];
  const names = items.map(item => String(item.name || '').toLowerCase()).join(' ');
  if (/push|chest|shoulder|biceps|diamond|narrow|wide/.test(names)) return 'Upper Body';
  if (/squat|lunge|leg|glute|wall/.test(names)) return 'Lower Body';
  if (/plank|sit|core|abs/.test(names)) return 'Core';
  if (/jump|burpee|mountain|high/.test(names)) return 'Cardio';
  return plan?.name || 'Today Workout';
};

export function buildRecoveryMatch(meal = {}) {
  const stats = readJson('fitcoach_workout_stats', {}) || {};
  const plan = readJson('fitcoach_today_plan', null);
  const calories = getMealMacro(meal, ['calories']);
  const protein = getMealMacro(meal, ['protein']);
  const carbs = getMealMacro(meal, ['carbohydrates', 'carbs']);
  const fat = getMealMacro(meal, ['fat', 'fats']);
  const workoutCalories = Math.max(120, Math.min(650, Math.round(stats.totalCalories / Math.max(stats.totalWorkouts || 0, 1)) || 260));
  const proteinTarget = 28;
  const carbTarget = inferWorkoutFocus(plan) === 'Cardio' ? 55 : 35;
  const calorieTarget = Math.round(workoutCalories * 1.15);

  const proteinScore = Math.min(1, protein / proteinTarget);
  const carbScore = Math.min(1, carbs / carbTarget);
  const calorieScore = calories > 0 ? Math.max(0, 1 - Math.abs(calories - calorieTarget) / calorieTarget) : 0;
  const fatPenalty = fat > 28 ? Math.min(18, (fat - 28) * 0.8) : 0;
  const score = Math.max(0, Math.min(100, Math.round((proteinScore * 48) + (carbScore * 24) + (calorieScore * 28) - fatPenalty)));
  const focus = inferWorkoutFocus(plan);

  const verdict = score >= 82
    ? 'Strong recovery meal'
    : score >= 62
      ? 'Good recovery fit'
      : 'Needs a recovery boost';

  const nextStep = protein < proteinTarget
    ? `Add about ${Math.max(5, Math.round(proteinTarget - protein))}g protein to better support ${focus} recovery.`
    : carbs < carbTarget * 0.6
      ? 'Add a clean carb source if this meal is right after training.'
      : 'This meal is well aligned with your post-workout window.';

  return {
    score,
    verdict,
    focus,
    proteinTarget,
    carbTarget,
    calorieTarget,
    proteinCoverage: Math.min(100, Math.round((protein / proteinTarget) * 100)),
    carbCoverage: Math.min(100, Math.round((carbs / carbTarget) * 100)),
    calorieCoverage: Math.min(100, Math.round((calories / calorieTarget) * 100)),
    nextStep,
  };
}
