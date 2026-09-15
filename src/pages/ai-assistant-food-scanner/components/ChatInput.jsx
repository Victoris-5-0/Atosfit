import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../contexts/LanguageContext';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const { isRTL, t } = useLanguage();

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message?.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef?.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const quickPrompts = [
    t('chat.promptBeginner'),
    t('chat.promptMeal'),
    t('chat.promptPrep'),
    t('chat.promptForm')
  ];

  return (
    <div className="chat-input-container">
      
      {/* Quick Prompts */}
      <div className="chat-input-prompts">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => !disabled && onSendMessage(prompt)}
            disabled={disabled}
            className="chat-input-prompt-btn"
            style={{
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder={t('chat.input')}
            disabled={disabled}
            rows={1}
            className="chat-input-textarea"
            style={{
              opacity: disabled ? 0.6 : 1
            }}
          />
          <button
            type="button"
            disabled={disabled}
            className="chat-input-mic-btn"
            style={{
              color: isRecording ? '#FF8A00' : undefined
            }}
          >
            <Icon name="Mic" size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="btn-coral chat-input-send-btn"
          style={{ 
            opacity: (!message.trim() || disabled) ? 0.5 : 1,
            cursor: (!message.trim() || disabled) ? 'not-allowed' : 'pointer'
          }}
        >
          <Icon name="Send" size={20} color="#181818" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
