import React from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../contexts/LanguageContext';

const ChatMessage = ({ message, isUser, timestamp, isTyping = false }) => {
  const { language } = useLanguage();
  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (isTyping) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '1rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(167,162,137,0.1)', border: '1px solid rgba(167,162,137,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="Bot" size={18} color="var(--bento-muted)" />
        </div>
        <div style={{ background: 'rgba(167,162,137,0.08)', borderRadius: '20px 20px 20px 4px', padding: '1rem', border: '1px solid rgba(167,162,137,0.15)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div className="atos-typing-dot"></div>
            <div className="atos-typing-dot atos-typing-dot-delay-1"></div>
            <div className="atos-typing-dot atos-typing-dot-delay-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-message-row ${isUser ? 'user-msg' : 'coach-msg'}`} style={{
      flexDirection: isUser ? 'row-reverse' : 'row'
    }}>
      {/* Avatar */}
      <div className="chat-message-avatar" style={{ 
        background: isUser ? 'rgba(255, 138, 0,0.15)' : 'rgba(167,162,137,0.1)',
        border: `1px solid ${isUser ? 'rgba(255, 138, 0,0.3)' : 'rgba(167,162,137,0.2)'}`,
        boxShadow: isUser ? '0 0 10px rgba(255, 138, 0,0.2)' : 'none'
      }}>
        <Icon name={isUser ? 'User' : 'Bot'} size={18} color={isUser ? '#FF8A00' : 'var(--bento-muted)'} />
      </div>
      
      {/* Message Bubble */}
      <div className="chat-message-bubble-wrapper">
        <div className="chat-message-bubble" style={{ 
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          background: isUser ? 'linear-gradient(135deg, rgba(255, 138, 0,0.15) 0%, rgba(255, 138, 0,0.05) 100%)' : 'rgba(167,162,137,0.08)',
          border: `1px solid ${isUser ? 'rgba(255, 138, 0,0.25)' : 'rgba(167,162,137,0.15)'}`,
          color: isUser ? 'var(--bento-text)' : 'var(--bento-soft-text)',
          boxShadow: isUser ? '0 4px 20px rgba(255, 138, 0,0.05)' : 'none'
        }}>
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(message) }}
            style={{ margin: 0, '& p': { margin: 0 } }}
          />
        </div>
        <span className="chat-message-time" style={{ 
          textAlign: isUser ? 'right' : 'left'
        }}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
};

const normalizePlainText = (text) => (
  String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/```([\s\S]*?)```/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
);

// Render AI text as clean readable paragraphs, even if the model returns markdown.
const renderMarkdownToHtml = (text) => {
  if (!text) return '';
  let escaped = normalizePlainText(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const lines = escaped.split('\n');
  let html = '';
  for (const line of lines) {
    if (line.trim() === '') html += '<br/>';
    else html += `<p style="margin:0 0 8px 0;">${line}</p>`;
  }
  return html;
};

export default ChatMessage;
