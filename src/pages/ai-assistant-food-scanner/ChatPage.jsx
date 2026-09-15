import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ChatHistory from './components/ChatHistory';
import { saveConversationTurn, getConversationMessages, getConversations } from '../../utils/api/chatApi';
import { getAccountId } from '../../utils/localAccountStorage';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/bento-dashboard.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, message: t('chat.welcome'), isUser: false, timestamp: new Date() }]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [user, setUser] = useState({ name: 'Mahmoud Ayman', profilePicture: '' });
  const chatContainerRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = 'var(--bento-bg)';
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.name) setUser(u);
    } catch { }
  }, []);

  const welcomeMessage = () => ({
    id: `welcome-${Date.now()}`,
    message: t('chat.welcome'),
    isUser: false,
    timestamp: new Date(),
  });

  const getUserId = () => getAccountId(user.principal || user.id || user.email || user.name);

  const getCurrentConversationKey = (userId) => `atos_ai_chat_current_conversation:${getAccountId(userId)}`;

  const formatConversationMessages = (items = []) => items.map(m => ({
    id: m.id,
    message: m.message,
    isUser: m.is_user_message,
    timestamp: new Date(m.timestamp),
  }));

  const loadConversationMessages = async (conversationId, title = null) => {
    if (!conversationId) return false;
    const userId = getUserId();
    const storedMessages = await getConversationMessages(userId, conversationId);
    if (!storedMessages?.length) return false;

    setMessages(formatConversationMessages(storedMessages));
    setCurrentConversationId(conversationId);
    setCurrentConversationTitle(title || storedMessages[0].conversation_title || storedMessages[0].message.substring(0, 30));
    localStorage.setItem(getCurrentConversationKey(userId), conversationId);
    return true;
  };

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const userId = getUserId();
        const requestedConversationId = searchParams.get('conversation');
        const lastConversationId = localStorage.getItem(getCurrentConversationKey(userId));
        const conversationId = requestedConversationId || lastConversationId;

        if (await loadConversationMessages(conversationId)) return;

        const [latestConversation] = await getConversations(userId, 1);
        if (latestConversation) {
          await loadConversationMessages(latestConversation.id, latestConversation.title);
        }
      } catch (error) { console.error('Error loading conversation:', error); }
    };
    loadConversation();
  }, [searchParams, user]);

  useEffect(() => {
    if (chatContainerRef?.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const CHATBOT_API_KEY = import.meta.env.VITE_CHATBOT_API_KEY || '';

  const handleSendMessage = async (message) => {
    const userMessage = { id: Date.now(), message, isUser: true, timestamp: new Date() };
    const recentConversation = messages
      .filter(item => item?.message && !String(item.id).startsWith('welcome-'))
      .slice(-12)
      .map(item => `${item.isUser ? 'User' : 'AI Coach'}: ${item.message}`)
      .join('\n');
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      if (!CHATBOT_API_KEY) {
        throw new Error('Gemini API key is missing. Add a fresh VITE_CHATBOT_API_KEY to .env.');
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${CHATBOT_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are ATOS fit, a helpful AI fitness coach.
Answer in plain text only. Do not use Markdown formatting or symbols such as #, ##, ###, **, *, -, or ---.
Use short paragraphs or numbered lines without special symbols.
Reply in ${language === 'ar' ? 'Arabic unless the user asks for another language' : 'English unless the user asks for another language'}.

Conversation so far:
${recentConversation || 'This is the first user turn in this chat.'}

User message: ${message}`
            }]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error.message || 'AI service error.');
      }
      if (!response.ok) throw new Error(`AI service request failed with status ${response.status}.`);
      let aiText = t('chat.fallback');
      if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
        const parts = data.candidates[0]?.content?.parts;
        if (Array.isArray(parts) && parts[0]?.text) {
          aiText = parts[0].text.trim();
        }
      }

      const aiMessage = { id: Date.now() + 1, message: aiText, isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      const userId = getUserId();
      if (userId) {
        try {
          const result = await saveConversationTurn(userId, message, aiText, currentConversationId);
          if (!currentConversationId && result.conversationId) {
            setCurrentConversationId(result.conversationId);
            setCurrentConversationTitle(message.substring(0, 30));
          }
          localStorage.setItem(getCurrentConversationKey(userId), result.conversationId || currentConversationId);
          setHistoryVersion(version => version + 1);
        } catch (historyError) {
          console.warn('AI chat response received, but conversation history could not be saved:', historyError);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, message: `Error: ${error.message}`, isUser: false, timestamp: new Date() }]);
      setIsTyping(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    if (conversation) {
      try {
        await loadConversationMessages(conversation.id, conversation.title);
        setIsChatHistoryOpen(false);
      } catch (error) {
        console.warn('Selected conversation could not be loaded:', error);
      }
    } else {
      const userId = getUserId();
      setCurrentConversationId(null);
      setCurrentConversationTitle(null);
      setMessages([welcomeMessage()]);
      localStorage.removeItem(getCurrentConversationKey(userId));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-screen');
  };

  return (
    <div className="bento-root">
      {/* Ambient Trails */}
      <div className="trail trail-coral" style={{ width: 600, height: 600, top: '-10%', right: '10%', opacity: 0.08 }} />
      <div className="trail trail-olive" style={{ width: 500, height: 500, bottom: '5%', left: '5%', opacity: 0.06 }} />

      <AppHeader
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-20 lg:pl-72 min-h-screen">
        <div className="px-3 py-3 md:px-6 md:py-4 max-w-[1500px] mx-auto flex flex-col h-[calc(100vh-100px)]">

          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--bento-text)', margin: 0, letterSpacing: '0' }}>{t('chat.title')}</h1>
              <p style={{ color: 'var(--bento-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>{t('chat.subtitle')}</p>
            </div>
            <button
              onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
              className="btn-olive"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <Icon name="History" size={16} /> {isChatHistoryOpen ? t('common.messages') : t('chat.history')}
            </button>
          </div>

          <div className={`flex-1 grid gap-4 min-h-0 transition-all duration-300 ${isChatHistoryOpen ? 'grid-cols-1 lg:grid-cols-[300px_1fr]' : 'grid-cols-1'}`}>

            {/* History Sidebar */}
            <div className={`bento-card flex-col h-full overflow-hidden transition-all duration-300 ${isChatHistoryOpen ? 'flex lg:max-w-[320px] w-full' : 'hidden'}`}>
              <ChatHistory
                isOpen={true}
                onClose={() => setIsChatHistoryOpen(false)}
                onConversationSelect={handleConversationSelect}
                currentConversationId={currentConversationId}
                refreshKey={historyVersion}
              />
            </div>

            {/* Main Chat Area */}
            <div className={`bento-card flex-col h-full overflow-hidden ${isChatHistoryOpen ? 'hidden lg:flex' : 'flex'}`}>

              {/* Chat Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bento-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bento-chip)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255, 138, 0,0.15)', border: '1px solid rgba(255, 138, 0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(255, 138, 0,0.2)' }}>
                    <Icon name="Bot" size={20} color="#FF8A00" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0 }}>{t('chat.coach')}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF8A00', boxShadow: '0 0 8px #FF8A00' }}></span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--bento-muted)', fontWeight: 600 }}>{t('chat.ready')}</span>
                    </div>
                  </div>
                </div>
                {currentConversationTitle && (
                  <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--bento-soft-text)', fontWeight: 700, margin: 0, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentConversationTitle}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--bento-muted)' }}>{messages.length} {t('common.messages')}</p>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages?.map((m) => (
                  <ChatMessage key={m?.id} message={m?.message} isUser={m?.isUser} timestamp={m?.timestamp} />
                ))}
                {isTyping && <ChatMessage message="" isUser={false} timestamp={new Date()} isTyping={true} />}
              </div>

              {/* Chat Input */}
              <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
