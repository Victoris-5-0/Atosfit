const firstDefined = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== '') {
      return source[key];
    }
  }
  return undefined;
};

export const parseNutritionNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
  if (typeof value === 'string') {
    const match = value.replace(',', '.').match(/-?\d+(\.\d+)?/);
    return match ? Math.max(0, Number(match[0])) : 0;
  }
  return 0;
};

const estimateMissingMacros = (foodName, calories) => {
  const name = String(foodName || '').toLowerCase();
  const kcal = parseNutritionNumber(calories);
  if (!kcal) return { protein: 0, carbohydrates: 0, fat: 0, sugar: 0 };

  if (/burger|sandwich|meat|chicken|beef|egg|cheese/.test(name)) {
    return {
      protein: Math.round(kcal * 0.17 / 4),
      carbohydrates: Math.round(kcal * 0.38 / 4),
      fat: Math.round(kcal * 0.45 / 9),
      sugar: Math.round(kcal * 0.06 / 4),
    };
  }

  if (/pancake|cake|dessert|sweet|strawberry|cream|caramel|chocolate|donut|cookie/.test(name)) {
    return {
      protein: Math.round(kcal * 0.08 / 4),
      carbohydrates: Math.round(kcal * 0.58 / 4),
      fat: Math.round(kcal * 0.34 / 9),
      sugar: Math.round(kcal * 0.28 / 4),
    };
  }

  return {
    protein: Math.round(kcal * 0.14 / 4),
    carbohydrates: Math.round(kcal * 0.50 / 4),
    fat: Math.round(kcal * 0.36 / 9),
    sugar: Math.round(kcal * 0.12 / 4),
  };
};

const fillMacroGaps = (normalized) => {
  if (normalized.calories <= 0) return normalized;
  const estimate = estimateMissingMacros(normalized.name, normalized.calories);

  if (normalized.protein === 0) normalized.protein = estimate.protein;
  if (normalized.carbohydrates === 0) normalized.carbohydrates = estimate.carbohydrates;
  if (normalized.fat === 0) normalized.fat = estimate.fat;
  if (normalized.sugar === 0) normalized.sugar = estimate.sugar;
  normalized.macroEstimated = true;
  return normalized;
};

export function normalizeFoodAnalysis(raw = {}, extras = {}) {
  const normalized = {
    name: firstDefined(raw, ['name', 'food_name', 'foodName', 'dish', 'item']) || extras.defaultName || 'Unknown Food',
    calories: parseNutritionNumber(firstDefined(raw, ['calories', 'kcal', 'calorie_estimate', 'energy_kcal', 'energy'])),
    protein: parseNutritionNumber(firstDefined(raw, ['protein', 'protein_g', 'proteins', 'proteinGrams'])),
    carbohydrates: parseNutritionNumber(firstDefined(raw, ['carbohydrates', 'carbs', 'carbs_g', 'carbohydrate', 'carbohydrate_g', 'total_carbohydrate', 'totalCarbohydrate'])),
    fat: parseNutritionNumber(firstDefined(raw, ['fat', 'fats', 'fat_g', 'total_fat', 'totalFat'])),
    sugar: parseNutritionNumber(firstDefined(raw, ['sugar', 'sugars', 'sugar_g', 'total_sugar', 'totalSugars'])),
    servingSize: firstDefined(raw, ['serving_size', 'servingSize', 'portion_size', 'portionSize', 'serving']) || '',
    recommendation: raw.recommendation || raw.notes || '',
    allergens: raw.allergens || raw.allergen_info || '',
    healthScore: parseNutritionNumber(firstDefined(raw, ['health_score', 'healthScore'])),
    ...extras,
  };

  if (
    normalized.calories > 0 &&
    (normalized.protein === 0 || normalized.carbohydrates === 0 || normalized.fat === 0)
  ) {
    fillMacroGaps(normalized);
  }

  normalized.carbs = normalized.carbohydrates;
  normalized.fats = normalized.fat;
  return normalized;
}

const toFoodResult = (parsed) => {
  if (Array.isArray(parsed)) return parsed[0] || null;
  if (Array.isArray(parsed?.foods)) return parsed.foods[0] || null;
  if (Array.isArray(parsed?.items)) return parsed.items[0] || null;
  if (parsed?.food) return parsed.food;
  if (parsed?.result) return parsed.result;
  return parsed && typeof parsed === 'object' ? parsed : null;
};

const cleanJsonCandidate = (value) => String(value || '')
  .trim()
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```\s*$/i, '')
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/,\s*([}\]])/g, '$1')
  .trim();

const parseLooseFields = (text) => {
  const source = cleanJsonCandidate(text);
  const readString = (keys) => {
    for (const key of keys) {
      const match = source.match(new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"']+)["']`, 'i'));
      if (match?.[1]) return match[1].trim();
    }
    return '';
  };
  const readNumber = (keys) => {
    for (const key of keys) {
      const match = source.match(new RegExp(`["']?${key}["']?\\s*:\\s*["']?(-?\\d+(?:\\.\\d+)?)`, 'i'));
      if (match?.[1]) return Number(match[1]);
    }
    return 0;
  };

  const result = {
    name: readString(['name', 'food_name', 'foodName', 'dish', 'item']),
    calories: readNumber(['calories', 'kcal', 'energy_kcal', 'energy']),
    protein: readNumber(['protein', 'protein_g', 'proteins']),
    carbohydrates: readNumber(['carbohydrates', 'carbs', 'carbs_g', 'carbohydrate']),
    fat: readNumber(['fat', 'fats', 'fat_g', 'total_fat']),
    sugar: readNumber(['sugar', 'sugars', 'sugar_g']),
    serving_size: readString(['serving_size', 'servingSize', 'portion_size', 'portionSize', 'serving']),
  };

  return (result.name || result.calories > 0) ? result : null;
};

export function parseFoodAnalysisResponse(text = '') {
  const rawText = String(text || '').trim();
  if (!rawText) return null;

  const candidates = [
    cleanJsonCandidate(rawText),
  ];

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) candidates.push(cleanJsonCandidate(fencedMatch[1]));

  const objectMatch = rawText.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) candidates.push(cleanJsonCandidate(objectMatch[0]));

  const arrayMatch = rawText.match(/\[[\s\S]*\]/);
  if (arrayMatch?.[0]) candidates.push(cleanJsonCandidate(arrayMatch[0]));

  for (const candidate of [...new Set(candidates.filter(Boolean))]) {
    try {
      const parsed = JSON.parse(candidate);
      const result = toFoodResult(parsed);
      if (result) return result;
    } catch {}
  }

  const looseResult = parseLooseFields(rawText);
  if (looseResult) return looseResult;

  return null;
}
