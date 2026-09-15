import { getAccountId, getLocalFoodLogs } from './localAccountStorage';

export const DASHBOARD_DATA_UPDATED = 'dashboardDataUpdated';

export const STORAGE_KEYS = {
  USER: 'user',
  WORKOUT_STATS: 'fitcoach_workout_stats',
  DAILY_PROGRESS: 'fitcoach_daily_progress',
  BADGES: 'fitcoach_badges',
  TODAY_PLAN: 'fitcoach_today_plan'
};

const DAY_MS = 24 * 60 * 60 * 1000;

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  return value;
};

export const toDateKey = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
};

export const getWeekRange = (date = new Date()) => {
  const current = date instanceof Date ? new Date(date) : new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay() || 7;
  const start = new Date(current);
  start.setDate(current.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end, startKey: toDateKey(start), endKey: toDateKey(end) };
};

const clampPct = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));

const sum = (items, selector) => items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);

const normalizeExercise = (name = '') => String(name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const emitDashboardDataUpdated = (detail = {}) => {
  window.dispatchEvent(new CustomEvent(DASHBOARD_DATA_UPDATED, { detail }));
};

export const getAllDailyProgress = () => readJson(STORAGE_KEYS.DAILY_PROGRESS, {}) || {};

export const getUserProfile = () => readJson(STORAGE_KEYS.USER, {}) || {};

export const getWorkoutStats = () => readJson(STORAGE_KEYS.WORKOUT_STATS, {}) || {};

export const getHydrationKey = (userId = null) => `atos_hydration:${getAccountId(userId)}`;

export const getHydrationStats = (userId = null, date = new Date()) => {
  const dateKey = toDateKey(date);
  const saved = readJson(getHydrationKey(userId), {});
  const record = saved?.date === dateKey ? saved : {};
  const goal = Number(record.goal) || 2500;
  const water = Number(record.water) || 0;
  const history = Array.isArray(record.history) ? record.history : [];

  return {
    date: dateKey,
    water,
    goal,
    history,
    percentage: goal ? clampPct((water / goal) * 100) : 0,
    remaining: Math.max(goal - water, 0),
    isComplete: goal > 0 && water >= goal
  };
};

export const saveHydrationStats = (stats, userId = null) => {
  const next = {
    date: stats.date || toDateKey(),
    water: Math.max(0, Number(stats.water) || 0),
    goal: Math.max(250, Number(stats.goal) || 2500),
    history: Array.isArray(stats.history) ? stats.history : []
  };
  writeJson(getHydrationKey(userId), next);
  emitDashboardDataUpdated({ type: 'HYDRATION_UPDATED', hydration: next });
  return getHydrationStats(userId, next.date);
};

export const addHydration = (amount, userId = null, date = new Date()) => {
  const current = getHydrationStats(userId, date);
  return saveHydrationStats({
    ...current,
    water: Math.min(current.goal, current.water + (Number(amount) || 0)),
    history: [...current.history, Number(amount) || 0].slice(-20)
  }, userId);
};

export const undoHydration = (userId = null, date = new Date()) => {
  const current = getHydrationStats(userId, date);
  const last = current.history[current.history.length - 1] || 0;
  return saveHydrationStats({
    ...current,
    water: Math.max(0, current.water - last),
    history: current.history.slice(0, -1)
  }, userId);
};

export const resetHydration = (userId = null, date = new Date()) => {
  const current = getHydrationStats(userId, date);
  return saveHydrationStats({ ...current, water: 0, history: [] }, userId);
};

export const setHydrationGoal = (goal, userId = null, date = new Date()) => {
  const current = getHydrationStats(userId, date);
  return saveHydrationStats({ ...current, goal: Number(goal) || current.goal }, userId);
};

export const getNutritionTargets = (user = {}) => ({
  calories: Number(user.dailyCalorieGoal || user.calorieGoal || user.targetCalories) || 2200,
  protein: Number(user.proteinGoal) || 150,
  carbs: Number(user.carbsGoal) || 300,
  fat: Number(user.fatGoal) || 80
});

export const getNutritionStats = (userId = null, date = new Date(), user = getUserProfile()) => {
  const dateKey = toDateKey(date);
  const meals = getLocalFoodLogs(getAccountId(userId), { date: dateKey });
  const totals = {
    calories: sum(meals, meal => meal.calories),
    protein: sum(meals, meal => meal.protein),
    carbs: sum(meals, meal => meal.carbs ?? meal.carbohydrates),
    fat: sum(meals, meal => meal.fat ?? meal.fats)
  };
  const targets = getNutritionTargets(user);

  return {
    date: dateKey,
    meals,
    mealCount: meals.length,
    targets,
    totals,
    remainingCalories: Math.max(targets.calories - totals.calories, 0),
    caloriesPct: clampPct((totals.calories / targets.calories) * 100),
    proteinPct: clampPct((totals.protein / targets.protein) * 100),
    carbsPct: clampPct((totals.carbs / targets.carbs) * 100),
    fatPct: clampPct((totals.fat / targets.fat) * 100),
    isLogged: meals.length > 0
  };
};

export const getTodayWorkoutStats = (date = new Date()) => {
  const dateKey = toDateKey(date);
  const allProgress = getAllDailyProgress();
  const progress = allProgress[dateKey] || {};
  const plan = readJson(STORAGE_KEYS.TODAY_PLAN, null);
  const planItems = plan?.exercises || plan?.items || [];
  const completedPlanItems = planItems.filter(item => item.completed);

  return {
    date: dateKey,
    plan,
    planItems,
    completedPlanItems,
    completedPlanCount: completedPlanItems.length,
    totalPlanCount: planItems.length,
    workoutsCompleted: Number(progress.workoutsCompleted) || 0,
    caloriesBurned: Number(progress.caloriesBurned) || 0,
    totalWorkoutTime: Number(progress.totalWorkoutTime) || 0,
    exercisesCompleted: progress.exercisesCompleted || [],
    exerciseDetails: progress.exerciseDetails || [],
    isCompleted: (Number(progress.workoutsCompleted) || 0) > 0 || (planItems.length > 0 && completedPlanItems.length === planItems.length)
  };
};

export const getWeeklyWorkoutStats = (date = new Date()) => {
  const { start, end } = getWeekRange(date);
  const allProgress = getAllDailyProgress();
  const days = Object.values(allProgress).filter(day => {
    const dayDate = new Date(day.date || day.dateISO || Date.now());
    return dayDate >= start && dayDate <= end;
  });
  const workoutsCompleted = sum(days, day => day.workoutsCompleted);
  const caloriesBurned = sum(days, day => day.caloriesBurned);
  const totalWorkoutTime = sum(days, day => day.totalWorkoutTime);
  const exerciseVolume = {};
  const exerciseDuration = {};

  days.forEach(day => {
    (day.exerciseDetails || []).forEach(item => {
      const key = normalizeExercise(item.name || item.exerciseName);
      if (!key) return;
      exerciseVolume[key] = (exerciseVolume[key] || 0) + (Number(item.reps) || 0) * (Number(item.sets) || 1);
      exerciseDuration[key] = (exerciseDuration[key] || 0) + (Number(item.durationSec) || 0);
    });
  });

  const weeklyGoal = Number(getUserProfile().weeklyWorkoutGoal || getUserProfile().workoutFrequency) || 5;

  return {
    start,
    end,
    days,
    workoutsCompleted,
    caloriesBurned,
    totalWorkoutTime,
    weeklyGoal,
    weeklyGoalPct: clampPct((workoutsCompleted / weeklyGoal) * 100),
    exerciseVolume,
    exerciseDuration,
    pushupVolume: Object.entries(exerciseVolume).filter(([name]) => name.includes('push')).reduce((total, [, value]) => total + value, 0),
    squatVolume: Object.entries(exerciseVolume).filter(([name]) => name.includes('squat')).reduce((total, [, value]) => total + value, 0),
    plankRecordSec: Math.max(0, ...Object.entries(exerciseDuration).filter(([name]) => name.includes('plank')).map(([, value]) => value))
  };
};

export const getWorkoutStreak = () => Number(getWorkoutStats().currentStreak || getUserProfile().currentStreak || 0);

export const getCaloriesBurned = (date = new Date()) => getTodayWorkoutStats(date).caloriesBurned;

export const getWeeklyGoalProgress = (date = new Date()) => {
  const weekly = getWeeklyWorkoutStats(date);
  return {
    completed: weekly.workoutsCompleted,
    goal: weekly.weeklyGoal,
    percentage: weekly.weeklyGoalPct
  };
};

export const getUserProgressStats = (date = new Date()) => {
  const today = getTodayWorkoutStats(date);
  const weekly = getWeeklyWorkoutStats(date);
  const stats = getWorkoutStats();
  return {
    totalWorkouts: Number(stats.totalWorkouts) || 0,
    totalCalories: Number(stats.totalCalories) || 0,
    totalWorkoutTime: Number(stats.totalWorkoutTime) || 0,
    currentStreak: getWorkoutStreak(),
    today,
    weekly
  };
};

export const getAchievementStats = () => {
  const badges = readJson(STORAGE_KEYS.BADGES, []);
  const unique = new Map();
  badges.forEach(badge => unique.set(String(badge.id || badge.code || badge.title), badge));
  return {
    badges: Array.from(unique.values()),
    unlockedCount: unique.size
  };
};

export const evaluateDashboardAchievements = (snapshot) => {
  const { todayWorkout, weeklyWorkout, nutrition, workoutStats } = snapshot;
  const definitions = [
    {
      id: 'first_workout_completed',
      title: 'First Workout Completed',
      icon: 'Trophy',
      condition: () => Number(workoutStats.totalWorkouts || todayWorkout.workoutsCompleted) >= 1
    },
    {
      id: 'seven_day_streak',
      title: '7-Day Streak',
      icon: 'Flame',
      condition: () => getWorkoutStreak() >= 7
    },
    {
      id: 'squat_goal',
      title: 'Squat Goal',
      icon: 'Award',
      condition: () => weeklyWorkout.squatVolume >= 100
    },
    {
      id: 'plank_record',
      title: 'Plank Record',
      icon: 'Timer',
      condition: () => weeklyWorkout.plankRecordSec >= 60
    },
    {
      id: 'nutrition_logger',
      title: 'Nutrition Logger',
      icon: 'Utensils',
      condition: () => nutrition.mealCount >= 1
    }
  ];

  const badges = readJson(STORAGE_KEYS.BADGES, []);
  const existing = new Set(badges.map(badge => String(badge.id || badge.code || badge.title)));
  const unlocked = [];
  definitions.forEach(def => {
    if (!existing.has(def.id) && def.condition()) {
      badges.push({
        id: def.id,
        code: def.id,
        title: def.title,
        icon: def.icon,
        progress: 1,
        target: 1,
        earnedAt: new Date().toISOString()
      });
      unlocked.push(def);
    }
  });
  if (unlocked.length > 0) {
    writeJson(STORAGE_KEYS.BADGES, badges);
    window.dispatchEvent(new CustomEvent('achievementEarned', { detail: unlocked[0] }));
  }
  return unlocked;
};

export const getReadinessScore = ({ todayWorkout, weeklyWorkout, hydration, nutrition }) => {
  const hasAnyData = todayWorkout.workoutsCompleted > 0 || weeklyWorkout.workoutsCompleted > 0 || hydration.water > 0 || nutrition.mealCount > 0;
  if (!hasAnyData) {
    return {
      score: null,
      label: 'Not enough data yet',
      isEstimated: false,
      factors: [
        { label: 'Hydration', val: 0 },
        { label: 'Recovery', val: 0 },
        { label: 'Strain', val: 0 }
      ],
      bestNextBlock: 'Choose a workout',
      copy: 'Complete a workout, add water, or log a meal to calculate readiness.'
    };
  }

  const hydrationVal = hydration.percentage;
  const nutritionVal = nutrition.mealCount ? Math.min(100, Math.round((nutrition.proteinPct + nutrition.caloriesPct) / 2)) : 20;
  const strainVal = weeklyWorkout.weeklyGoal ? clampPct(100 - (weeklyWorkout.workoutsCompleted / weeklyWorkout.weeklyGoal) * 45) : 70;
  const recoveryVal = clampPct((hydrationVal * 0.45) + (nutritionVal * 0.35) + (strainVal * 0.2));
  const score = clampPct((hydrationVal * 0.25) + (nutritionVal * 0.25) + (recoveryVal * 0.3) + (strainVal * 0.2));

  return {
    score,
    label: score >= 75 ? 'Ready to train' : score >= 55 ? 'Moderate readiness' : 'Prioritize recovery',
    isEstimated: true,
    factors: [
      { label: 'Hydration', val: hydrationVal },
      { label: 'Recovery', val: recoveryVal },
      { label: 'Strain', val: strainVal }
    ],
    bestNextBlock: score >= 65 ? 'Strength session' : 'Recovery block',
    copy: score >= 65 ? 'Your activity data supports a focused session today.' : 'Top up hydration or nutrition before a hard workout.'
  };
};

export const getDailyMissionProgress = ({ todayWorkout, nutrition, hydration }) => {
  const items = [
    {
      id: 'workout',
      icon: 'flame',
      label: 'Today plan',
      title: todayWorkout.isCompleted ? 'Workout complete' : (todayWorkout.plan?.name || 'Choose a workout'),
      meta: todayWorkout.isCompleted
        ? `${Math.round(todayWorkout.caloriesBurned)} kcal burned today`
        : (todayWorkout.planItems.length ? `${todayWorkout.completedPlanCount}/${todayWorkout.totalPlanCount} exercises done` : 'Start a guided workout to begin.'),
      done: todayWorkout.isCompleted,
      action: 'workout',
      cta: todayWorkout.isCompleted ? 'Review' : 'Start'
    },
    {
      id: 'meal',
      icon: 'fork',
      label: 'Nutrition',
      title: nutrition.isLogged ? `${nutrition.mealCount} meal${nutrition.mealCount === 1 ? '' : 's'} logged` : 'Log or scan a meal',
      meta: nutrition.isLogged ? `${Math.round(nutrition.totals.protein)}g protein logged today` : 'Nutrition updates recovery and readiness.',
      done: nutrition.isLogged,
      action: 'meal',
      cta: nutrition.isLogged ? 'History' : 'Scan'
    },
    {
      id: 'challenge',
      icon: 'target',
      label: 'Micro challenge',
      title: hydration.water >= 1000 ? 'Hydration rhythm started' : 'Reach 1000 ml water',
      meta: hydration.water >= 1000 ? `${hydration.water} ml logged` : `${Math.max(1000 - hydration.water, 0)} ml left for the challenge`,
      done: hydration.water >= 1000,
      action: 'hydrate',
      cta: '+250 ml'
    }
  ];

  const completedCount = items.filter(item => item.done).length;
  return {
    items,
    completedCount,
    coachNote: completedCount === 0
      ? 'Start with one real action: workout, meal scan, or hydration.'
      : completedCount === items.length
        ? 'Clean day. Your dashboard is fully updated from your activity.'
        : 'Good rhythm. Finish the smallest remaining mission to close the loop.',
    streakText: getWorkoutStreak() > 0 ? `${getWorkoutStreak()} day streak` : 'Start a new streak'
  };
};

export const getDynamicTip = ({ hydration, nutrition, todayWorkout, user }) => {
  if (hydration.percentage < 40) {
    return {
      title: 'Hydration Tip',
      body: `You still have ${hydration.remaining} ml left today. A small top-up now will improve readiness.`
    };
  }
  if (!nutrition.isLogged) {
    return {
      title: 'Nutrition',
      body: 'Scan or log one meal today so calories and macros can update from real data.'
    };
  }
  if (todayWorkout.isCompleted) {
    return {
      title: 'Recovery',
      body: 'Workout complete. Pair it with protein and water to protect tomorrow’s readiness.'
    };
  }
  return {
    title: 'Daily Focus',
    body: user?.primaryGoal ? `Keep today aligned with your ${user.primaryGoal} goal through one focused session.` : 'Choose one useful action and let the dashboard update from there.'
  };
};

export const getSubscriptionState = (user = getUserProfile()) => {
  const plan = String(user.subscriptionPlan || user.plan || user.subscription || 'free').toLowerCase();
  const isPro = ['pro', 'premium', 'paid', 'elite'].includes(plan);
  return { plan, isPro };
};

export const getDashboardSnapshot = (userId = null, date = new Date()) => {
  const user = getUserProfile();
  const accountId = getAccountId(userId || user.principal || user.id || user.email || user.name);
  const todayWorkout = getTodayWorkoutStats(date);
  const weeklyWorkout = getWeeklyWorkoutStats(date);
  const hydration = getHydrationStats(accountId, date);
  const nutrition = getNutritionStats(accountId, date, user);
  const workoutStats = getWorkoutStats();
  const readiness = getReadinessScore({ todayWorkout, weeklyWorkout, hydration, nutrition });
  const missions = getDailyMissionProgress({ todayWorkout, nutrition, hydration });
  const subscription = getSubscriptionState(user);
  const baseSnapshot = {
    user,
    accountId,
    dateKey: toDateKey(date),
    todayWorkout,
    weeklyWorkout,
    hydration,
    nutrition,
    workoutStats,
    readiness,
    missions,
    subscription
  };
  evaluateDashboardAchievements(baseSnapshot);
  const achievements = getAchievementStats();
  const tip = getDynamicTip({ hydration, nutrition, todayWorkout, user });
  return { ...baseSnapshot, achievements, tip };
};

export const recordDashboardEvent = (type, detail = {}) => {
  emitDashboardDataUpdated({ type, ...detail });
};
