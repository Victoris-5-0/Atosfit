import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/bento-dashboard.css';

const CommunityPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Mahmoud Ayman', profilePicture: '' });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.name) setUser(u);
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-screen');
  };

  const features = [
    {
      icon: 'Users',
      title: t('community.share'),
      description: t('community.shareCopy'),
      highlight: true
    },
    {
      icon: 'MessageSquare',
      title: t('community.engage'),
      description: t('community.engageCopy'),
    },
    {
      icon: 'Heart',
      title: t('community.support'),
      description: t('community.supportCopy'),
    },
    {
      icon: 'Share2',
      title: t('community.social'),
      description: t('community.socialCopy'),
    }
  ];

  return (
    <div className="bento-root community-shell">
      {/* Ambient background trails */}
      <div className="trail trail-coral" style={{ width: 700, height: 700, top: '-15%', left: '-5%', opacity: 0.08 }} />
      <div className="trail trail-olive" style={{ width: 600, height: 600, bottom: '-5%', right: '-10%', opacity: 0.06 }} />

      <AppHeader
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />
      
      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-24 lg:pl-72 min-h-screen relative z-10">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--bento-text)', margin: 0, letterSpacing: '0' }}>{t('community.title')}</h1>
            <p style={{ color: 'var(--bento-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>{t('community.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            
            {/* Hero / Banner Widget */}
            <div className="bento-card community-card community-hero col-span-1 md:col-span-2 lg:col-span-4" style={{ padding: 'clamp(1.75rem, 3vw, 2.5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255, 138, 0,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: '-30px', left: '10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(167,162,137,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ width: 80, height: 80, margin: '0 auto 1.5rem', background: 'rgba(255, 138, 0,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 138, 0,0.3)', boxShadow: '0 0 20px rgba(255, 138, 0,0.15)' }}>
                  <Icon name="Users" size={36} color="#FF8A00" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--bento-text)', marginBottom: '1rem' }}>{t('community.hero')}</h2>
                <p style={{ fontSize: '1.05rem', color: 'var(--bento-soft-text)', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  {t('community.heroCopy')}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.5rem', background: 'rgba(255, 138, 0,0.15)', border: '1px solid rgba(255, 138, 0,0.3)', borderRadius: '999px', color: '#FF8A00', fontWeight: 800, fontSize: '0.9rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF8A00', animation: 'badgePing 1.5s infinite' }}></span>
                  {t('community.launching')}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            {features.map((feature, idx) => (
              <div key={idx} className="bento-card community-card col-span-1" style={{ padding: '1.5rem', minHeight: '100%' }}>
                <div style={{ width: 48, height: 48, borderRadius: '16px', background: feature.highlight ? 'rgba(255, 138, 0,0.15)' : 'rgba(167,162,137,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: `1px solid ${feature.highlight ? 'rgba(255, 138, 0,0.3)' : 'rgba(167,162,137,0.2)'}` }}>
                  <Icon name={feature.icon} size={24} color={feature.highlight ? '#FF8A00' : '#a7a289'} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: feature.highlight ? '#FF8A00' : 'var(--bento-text)', marginBottom: '0.75rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--bento-soft-text)', fontSize: '0.9rem', lineHeight: '1.55' }}>{feature.description}</p>
              </div>
            ))}

            {/* Sneak Peek / Bottom Banner */}
            <div className="bento-card community-card col-span-1 md:col-span-2 lg:col-span-4" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--bento-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="Sparkles" size={24} color="var(--bento-muted)" /> {t('community.expect')}
                </h3>
                <p style={{ color: 'var(--bento-soft-text)' }}>{t('community.expectCopy')}</p>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(167,162,137,0.1)', border: '1px solid rgba(167,162,137,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="Trophy" size={20} color="#a7a289" />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#a7a289', fontWeight: 700 }}>{t('community.challenges')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(167,162,137,0.1)', border: '1px solid rgba(167,162,137,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="Target" size={20} color="#a7a289" />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#a7a289', fontWeight: 700 }}>{t('community.goals')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(167,162,137,0.1)', border: '1px solid rgba(167,162,137,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="MessageCircle" size={20} color="#a7a289" />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#a7a289', fontWeight: 700 }}>{t('community.advice')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;
