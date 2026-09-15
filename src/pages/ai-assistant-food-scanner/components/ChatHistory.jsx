import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { getConversations } from '../../../utils/api/chatApi';
import { getAccountId } from '../../../utils/localAccountStorage';
import { useLanguage } from '../../../contexts/LanguageContext';

const ChatHistory = ({ isOpen, onClose, onConversationSelect, currentConversationId, refreshKey = 0 }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  const loadConversations = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = getAccountId(user.principal || user.id || user.email || user.name);
      const convs = await getConversations(userId, 20);
      setConversations(convs);
    } catch (error) {
      console.warn('Chat history could not be loaded. Continuing without saved conversations:', error);
      setConversations([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadConversations(); }, [refreshKey]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const diff = Math.ceil(Math.abs(new Date() - d) / (1000 * 60 * 60 * 24));
    if (diff === 1) return t('common.today');
    if (diff === 2) return t('common.yesterday');
    if (diff <= 7) return `${diff - 1}d ago`;
    return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  if (!isOpen) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bento-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="History" size={20} color="var(--bento-muted)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0 }}>{t('chat.historyTitle')}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={loadConversations} style={{ background: 'var(--bento-chip)', border: 'none', color: 'var(--bento-muted)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FF8A00'} onMouseOut={e => e.currentTarget.style.color = 'var(--bento-muted)'} title={t('chat.refreshHistory')}>
            <Icon name="RefreshCw" size={14} />
          </button>
          <button onClick={onClose} className="lg:hidden" style={{ background: 'var(--bento-chip)', border: 'none', color: 'var(--bento-muted)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FF8A00'} onMouseOut={e => e.currentTarget.style.color = 'var(--bento-muted)'}>
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => onConversationSelect(null)}
          className="btn-coral"
          style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
        >
          <Icon name="Plus" size={18} color="#181818" /> {t('chat.newChat')}
        </button>
      </div>

      {/* List */}
      <div className="builder-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--bento-muted)' }}>{t('common.loading')}</div>
        ) : conversations.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--bento-muted)', gap: '1rem', opacity: 0.6 }}>
            <Icon name="MessageCircle" size={32} />
            <p style={{ fontSize: '0.85rem', margin: 0 }}>{t('chat.noPast')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversations.map(conv => {
              const active = currentConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => onConversationSelect(conv)}
                  style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    background: active ? 'rgba(255, 138, 0,0.12)' : 'var(--bento-chip)',
                    border: `1px solid ${active ? 'rgba(255, 138, 0,0.38)' : 'var(--bento-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { if(!active){ e.currentTarget.style.backgroundColor = 'var(--bento-chip-hover)'; e.currentTarget.style.borderColor = 'rgba(255, 138, 0,0.24)'; } }}
                  onMouseOut={e => { if(!active){ e.currentTarget.style.backgroundColor = 'var(--bento-chip)'; e.currentTarget.style.borderColor = 'var(--bento-border)'; } }}
                >
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? '#FF8A00' : 'var(--bento-text)', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--bento-muted)' }}>
                    <span>{conv.messageCount || 0} {t('chat.msgs')}</span>
                    <span>{formatDate(conv.lastMessage)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatHistory;
