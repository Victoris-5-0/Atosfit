import { supabase } from '../supabase';
import {
  saveLocalFoodLog,
  getLocalFoodLogs,
  deleteLocalFoodLog,
  clearLocalFoodLogs,
  mergeLocalFoodLogs,
} from '../localAccountStorage';
import { emitDashboardDataUpdated } from '../dashboardStatsService';

const toFoodRecord = (userId, foodData) => ({
  user_id: userId,
  food_name: foodData.foodName || foodData.name || foodData.food_name || 'Unknown Food',
  calories: Number(foodData.calories) || 0,
  protein: Number(foodData.protein) || 0,
  carbs: Number(foodData.carbs ?? foodData.carbohydrates) || 0,
  fat: Number(foodData.fat ?? foodData.fats) || 0,
  portion_size: foodData.portionSize || foodData.serving_size || foodData.servingSize || '',
  image_url: foodData.imageUrl || foodData.image || '',
  date_logged: foodData.dateLogged || foodData.date_logged || new Date().toISOString(),
});

export async function logFood(userId, foodData) {
  const local = saveLocalFoodLog(userId, foodData);
  emitDashboardDataUpdated({ type: 'MEAL_LOGGED', meal: local });

  const { data, error } = await supabase
    .from('food_logs')
    .insert(toFoodRecord(userId, foodData))
    .select()
    .single();

  if (error) {
    console.warn('Food log saved locally, but Supabase sync failed:', error);
    return local;
  }

  deleteLocalFoodLog(userId, local.id);
  const saved = saveLocalFoodLog(userId, { ...foodData, ...data, id: data.id });
  emitDashboardDataUpdated({ type: 'FOOD_SCAN_LOGGED', meal: saved });
  return saved;
}

export async function logFoods(userId, foods) {
  const localFoods = foods.map(food => saveLocalFoodLog(userId, food));
  emitDashboardDataUpdated({ type: 'MEALS_LOGGED', meals: localFoods });

  const { data, error } = await supabase
    .from('food_logs')
    .insert(foods.map(food => toFoodRecord(userId, food)))
    .select();

  if (error) {
    console.warn('Food logs saved locally, but Supabase sync failed:', error);
    return localFoods;
  }

  mergeLocalFoodLogs(userId, data || []);
  return data;
}

export async function getFoodLogs(userId, filters = {}) {
  let query = supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date_logged', { ascending: false });

  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte('date_logged', startOfDay.toISOString())
      .lte('date_logged', endOfDay.toISOString());
  }

  if (filters.startDate) query = query.gte('date_logged', filters.startDate);
  if (filters.endDate) query = query.lte('date_logged', filters.endDate);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;

  if (error) {
    console.warn('Loading Supabase food logs failed. Using local food history:', error);
    return getLocalFoodLogs(userId, filters);
  }

  const merged = mergeLocalFoodLogs(userId, data || []);
  return getLocalFoodLogs(userId, { ...filters, limit: filters.limit || merged.length });
}

export async function getFoodLogsByDate(userId, date) {
  return getFoodLogs(userId, { date });
}

export async function getDailyCalories(userId, date) {
  const foods = await getFoodLogsByDate(userId, date);
  return foods.reduce((total, food) => total + (food.calories || 0), 0);
}

export async function getDailyNutrition(userId, date) {
  const foods = await getFoodLogsByDate(userId, date);

  return {
    totalCalories: foods.reduce((sum, f) => sum + (f.calories || 0), 0),
    totalProtein: foods.reduce((sum, f) => sum + (f.protein || 0), 0),
    totalCarbs: foods.reduce((sum, f) => sum + (f.carbs || 0), 0),
    totalFat: foods.reduce((sum, f) => sum + (f.fat || 0), 0),
    mealCount: foods.length,
  };
}

export async function getWeeklyCalories(userId) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const foods = await getFoodLogs(userId, {
    startDate: weekAgo.toISOString(),
    endDate: today.toISOString(),
  });

  const dailyCalories = {};
  foods.forEach(food => {
    const date = food.date_logged.split('T')[0];
    dailyCalories[date] = (dailyCalories[date] || 0) + (food.calories || 0);
  });

  return dailyCalories;
}

export async function updateFoodLog(foodId, updates) {
  const { data, error } = await supabase
    .from('food_logs')
    .update(updates)
    .eq('id', foodId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFoodLog(foodId, userId = null) {
  if (userId) deleteLocalFoodLog(userId, foodId);
  emitDashboardDataUpdated({ type: 'MEAL_DELETED', foodId });

  const { data, error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', foodId)
    .select()
    .single();

  if (error) {
    console.warn('Food log deleted locally, but Supabase delete failed:', error);
    return null;
  }

  return data;
}

export async function clearAllFoodLogs(userId) {
  clearLocalFoodLogs(userId);
  emitDashboardDataUpdated({ type: 'MEALS_CLEARED' });

  const { data, error } = await supabase
    .from('food_logs')
    .delete()
    .eq('user_id', userId)
    .select();

  if (error) {
    console.warn('Food logs cleared locally, but Supabase clear failed:', error);
    return [];
  }

  return data;
}

export default {
  logFood,
  logFoods,
  getFoodLogs,
  getFoodLogsByDate,
  getDailyCalories,
  getDailyNutrition,
  getWeeklyCalories,
  updateFoodLog,
  deleteFoodLog,
  clearAllFoodLogs,
};
