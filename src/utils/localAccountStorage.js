const APP_PREFIX = 'atos_account';

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export function getAccountId(explicitUserId = null) {
  if (explicitUserId) return String(explicitUserId);
  const user = getStoredUser();
  return String(user.principal || user.id || user.email || user.name || 'default-user');
}

function keyFor(scope, userId) {
  return `${APP_PREFIX}:${getAccountId(userId)}:${scope}`;
}

function readJson(scope, fallback, userId) {
  try {
    const raw = localStorage.getItem(keyFor(scope, userId));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(scope, value, userId) {
  try {
    localStorage.setItem(keyFor(scope, userId), JSON.stringify(value));
  } catch {}
  return value;
}

export function getLocalConversations(userId) {
  return readJson('chat_conversations', [], userId);
}

export function getLocalConversationMessages(userId, conversationId) {
  return readJson(`chat_messages:${conversationId}`, [], userId);
}

export function saveLocalConversationTurn(userId, userMessage, botResponse, conversationId = null) {
  const convId = conversationId || crypto.randomUUID();
  const now = new Date().toISOString();
  const title = String(userMessage || 'New conversation').slice(0, 50);
  const messages = getLocalConversationMessages(userId, convId);
  const nextMessages = [
    ...messages,
    {
      id: `${Date.now()}-user`,
      user_id: getAccountId(userId),
      message: userMessage,
      is_user_message: true,
      conversation_id: convId,
      conversation_title: title,
      timestamp: now,
    },
    {
      id: `${Date.now()}-bot`,
      user_id: getAccountId(userId),
      message: botResponse,
      is_user_message: false,
      conversation_id: convId,
      conversation_title: title,
      timestamp: now,
    },
  ];
  writeJson(`chat_messages:${convId}`, nextMessages, userId);

  const conversations = getLocalConversations(userId);
  const existing = conversations.find(item => item.id === convId);
  const nextConversations = [
    {
      id: convId,
      title: existing?.title || title,
      lastMessage: now,
      messageCount: nextMessages.length,
    },
    ...conversations.filter(item => item.id !== convId),
  ];
  writeJson('chat_conversations', nextConversations, userId);

  return { conversationId: convId, messages: nextMessages };
}

export function deleteLocalConversation(userId, conversationId) {
  const conversations = getLocalConversations(userId).filter(item => item.id !== conversationId);
  writeJson('chat_conversations', conversations, userId);
  try {
    localStorage.removeItem(keyFor(`chat_messages:${conversationId}`, userId));
  } catch {}
  return [];
}

export function clearLocalConversations(userId) {
  const conversations = getLocalConversations(userId);
  conversations.forEach(item => {
    try {
      localStorage.removeItem(keyFor(`chat_messages:${item.id}`, userId));
    } catch {}
  });
  writeJson('chat_conversations', [], userId);
  return [];
}

export function getLocalFoodLogs(userId, filters = {}) {
  let logs = readJson('food_logs', [], userId);
  if (filters.date) {
    logs = logs.filter(item => new Date(item.date_logged).toISOString().slice(0, 10) === filters.date);
  }
  if (filters.startDate) {
    logs = logs.filter(item => new Date(item.date_logged) >= new Date(filters.startDate));
  }
  if (filters.endDate) {
    logs = logs.filter(item => new Date(item.date_logged) <= new Date(filters.endDate));
  }
  logs = logs.sort((a, b) => new Date(b.date_logged) - new Date(a.date_logged));
  return filters.limit ? logs.slice(0, filters.limit) : logs;
}

export function saveLocalFoodLog(userId, foodData) {
  const now = new Date().toISOString();
  const log = {
    id: foodData.id || `local-food-${Date.now()}`,
    user_id: getAccountId(userId),
    food_name: foodData.foodName || foodData.name || foodData.food_name || 'Unknown Food',
    calories: Number(foodData.calories) || 0,
    protein: Number(foodData.protein) || 0,
    carbs: Number(foodData.carbs ?? foodData.carbohydrates) || 0,
    fat: Number(foodData.fat ?? foodData.fats) || 0,
    sugar: Number(foodData.sugar) || 0,
    portion_size: foodData.portionSize || foodData.serving_size || foodData.servingSize || '',
    image_url: foodData.imageUrl || foodData.image || '',
    scan_type: foodData.scanType || 'food',
    recommendation: foodData.recommendation || '',
    date_logged: foodData.dateLogged || foodData.date_logged || now,
    local_only: !foodData.id,
  };
  const logs = readJson('food_logs', [], userId).filter(item => item.id !== log.id);
  writeJson('food_logs', [log, ...logs], userId);
  return log;
}

export function deleteLocalFoodLog(userId, foodId) {
  const logs = readJson('food_logs', [], userId).filter(item => item.id !== foodId);
  writeJson('food_logs', logs, userId);
  return null;
}

export function clearLocalFoodLogs(userId) {
  writeJson('food_logs', [], userId);
  return [];
}

export function mergeLocalFoodLogs(userId, remoteLogs = []) {
  const existing = readJson('food_logs', [], userId);
  const byId = new Map(existing.map(item => [String(item.id), item]));
  remoteLogs.forEach(item => byId.set(String(item.id), item));
  const merged = Array.from(byId.values()).sort((a, b) => new Date(b.date_logged) - new Date(a.date_logged));
  writeJson('food_logs', merged, userId);
  return merged;
}
