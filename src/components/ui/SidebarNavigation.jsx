import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import logoImage from '../../assets/logo.png';
import { useLanguage } from '../../contexts/LanguageContext';

const SidebarNavigation = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isRTL, t } = useLanguage();

  const navItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: 'Home' },
    { label: t('nav.exercises'), path: '/exercise-library', icon: 'Dumbbell' },
    { label: t('nav.aiChatbot'), path: '/ai-chat', icon: 'MessageCircle' },
    { label: t('nav.foodScanner'), path: '/food-scanner', icon: 'ScanLine' },
    { label: t('nav.profile'), path: '/user-profile', icon: 'User' },
    { label: t('nav.achievements'), path: '/achievements', icon: 'Trophy' },
    { label: t('nav.community'), path: '/community', icon: 'Users' },
  ];

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 190 }}
          className="lg:hidden"
        />
      )}

      {/* Floating Sidebar */}
      <aside 
        style={{
          position: 'fixed',
          top: 16,
          [isRTL ? 'right' : 'left']: 16,
          height: 'calc(100vh - 32px)',
          width: 252,
          background: 'var(--bento-card)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid var(--bento-border)',
          borderRadius: '26px',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--bento-shadow)',
          overflow: 'hidden',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className={`atos-sidebar lg:translate-x-0 ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-[120%]' : '-translate-x-[120%]'}`}
      >
        {/* Logo Area */}
        <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid rgba(167,162,137,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoImage} alt="ATOSfit Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--bento-text)', letterSpacing: '0.02em' }}>ATOSfit</span>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden"
            style={{ background: 'transparent', border: 'none', color: 'var(--bento-muted)', padding: '4px' }}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1.25rem 1rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--bento-muted)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem', paddingInlineStart: '0.5rem' }}>{t('nav.mainMenu')}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map(it => {
              const active = location.pathname === it.path;
              return (
                <button
                  key={it.path}
                  onClick={() => handleNav(it.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem 1rem',
                    borderRadius: '16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.25s ease',
                    background: active ? 'rgba(255, 138, 0,0.15)' : 'transparent',
                    color: active ? '#FF8A00' : 'var(--bento-muted)',
                    borderInlineStart: active ? '3px solid #FF8A00' : '3px solid transparent',
                    boxShadow: active ? 'inset 3px 0 12px rgba(255, 138, 0,0.12)' : 'none'
                  }}
                  onMouseOver={e => { if (!active) { e.currentTarget.style.backgroundColor = 'var(--bento-chip)'; e.currentTarget.style.color = 'var(--bento-text)'; } }}
                  onMouseOut={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--bento-muted)'; } }}
                >
                  <Icon name={it.icon} size={20} color={active ? '#FF8A00' : 'var(--bento-muted)'} />
                  <span style={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }}>{it.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Badge */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(167,162,137,0.1)' }}>
          <div style={{ background: 'rgba(255, 138, 0,0.1)', border: '1px solid rgba(255, 138, 0,0.25)', borderRadius: '14px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="Crown" size={16} color="#FF8A00" />
            <span style={{ fontSize: '0.78rem', color: '#FF8A00', fontWeight: 700 }}>{t('nav.freePlan')}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNavigation;
