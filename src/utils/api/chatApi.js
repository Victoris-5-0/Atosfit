import { supabase } from '../supabase';
import {
  saveLocalConversationTurn,
  getLocalConversations,
  getLocalConversationMessages,
  deleteLocalConversation,
  clearLocalConversations,
} from '../localAccountStorage';

export async function saveChatMessage(userId, message, isUserMessage = true, conversationId = null) {
  const { data, error } = await supabase
    .from('chatbot_logs')
    .insert({
      user_id: userId,
      message,
      is_user_message: isUserMessage,
      conversation_id: conversationId,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveChatResponse(userId, response, conversationId = null) {
  return saveChatMessage(userId, response, false, conversationId);
}

export async function saveConversationTurn(userId, userMessage, botResponse, conversationId = null) {
  const localResult = saveLocalConversationTurn(userId, userMessage, botResponse, conversationId);
  const convId = localResult.conversationId;

  const messages = [
    {
      user_id: userId,
      message: userMessage,
      is_user_message: true,
      conversation_id: convId,
      conversation_title: String(userMessage || 'New conversation').slice(0, 50),
      timestamp: new Date().toISOString(),
    },
    {
      user_id: userId,
      message: botResponse,
      is_user_message: false,
      conversation_id: convId,
      conversation_title: String(userMessage || 'New conversation').slice(0, 50),
      timestamp: new Date().toISOString(),
    },
  ];

  const { data, error } = await supabase
    .from('chatbot_logs')
    .insert(messages)
    .select();

  if (error) {
    console.warn('Conversation saved locally, but Supabase sync failed:', error);
    return { ...localResult, syncError: error };
  }

  return { conversationId: convId, messages: data };
}

export async function getChatHistory(userId, options = {}) {
  const { limit = 50, offset = 0, conversationId = null } = options;

  let query = supabase
    .from('chatbot_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: true })
    .range(offset, offset + limit - 1);

  if (conversationId) query = query.eq('conversation_id', conversationId);

  const { data, error } = await query;

  if (error) {
    console.warn('Loading Supabase chat history failed. Using local messages:', error);
    if (conversationId) return getLocalConversationMessages(userId, conversationId);
    return getLocalConversations(userId);
  }
  return data;
}

export async function getConversations(userId, limit = 20) {
  const { data, error } = await supabase
    .from('chatbot_logs')
    .select('conversation_id, timestamp, message, conversation_title')
    .eq('user_id', userId)
    .eq('is_user_message', true)
    .order('timestamp', { ascending: false })
    .limit(limit * 10);

  if (error) {
    console.warn('Loading Supabase conversations failed. Using local chat history:', error);
    return getLocalConversations(userId).slice(0, limit);
  }

  const conversations = {};
  data.forEach(log => {
    const convId = log.conversation_id || 'default';
    if (!conversations[convId]) {
      conversations[convId] = {
        id: convId,
        title: log.conversation_title || log.message.substring(0, 50) + (log.message.length > 50 ? '...' : ''),
        lastMessage: log.timestamp,
        messageCount: 1,
      };
    } else {
      conversations[convId].messageCount++;
    }
  });

  const remote = Object.values(conversations);
  const local = getLocalConversations(userId);
  const merged = [...remote, ...local.filter(item => !remote.some(remoteItem => remoteItem.id === item.id))];
  return merged.slice(0, limit);
}

export async function getConversationMessages(userId, conversationId) {
  const { data, error } = await supabase
    .from('chatbot_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.warn('Loading Supabase conversation messages failed. Using local messages:', error);
    return getLocalConversationMessages(userId, conversationId);
  }

  return data?.length ? data : getLocalConversationMessages(userId, conversationId);
}

export async function deleteConversation(userId, conversationId) {
  deleteLocalConversation(userId, conversationId);

  const { data, error } = await supabase
    .from('chatbot_logs')
    .delete()
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .select();

  if (error) {
    console.warn('Conversation deleted locally, but Supabase delete failed:', error);
    return [];
  }

  return data;
}

export async function renameConversation(userId, conversationId, newTitle) {
  const { data, error } = await supabase
    .from('chatbot_logs')
    .update({ conversation_title: newTitle })
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .select();

  if (error) throw error;
  return data;
}

export async function clearAllConversations(userId) {
  clearLocalConversations(userId);

  const { data, error } = await supabase
    .from('chatbot_logs')
    .delete()
    .eq('user_id', userId)
    .select();

  if (error) {
    console.warn('Conversations cleared locally, but Supabase clear failed:', error);
    return [];
  }

  return data;
}

export async function getMessageCount(userId) {
  const { count, error } = await supabase
    .from('chatbot_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) return getLocalConversations(userId).reduce((sum, item) => sum + (item.messageCount || 0), 0);
  return count;
}

export default {
  saveChatMessage,
  saveChatResponse,
  saveConversationTurn,
  getChatHistory,
  getConversations,
  getConversationMessages,
  deleteConversation,
  renameConversation,
  clearAllConversations,
  getMessageCount,
};
