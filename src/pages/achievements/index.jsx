import React, { useEffect, useState } from 'react';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import AchievementsTab from '../user-profile/components/AchievementsTab';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/bento-dashboard.css';

const AchievementsPage = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        setUser({
          id: u?.id || u?.principalId,
          name: u?.name || 'New User',
          email: u?.email || '',
          phone: u?.phone || '',
          dateOfBirth: u?.dateOfBirth || '',
          location: u?.location || '',
          profilePicture: u?.profilePicture || '',
          joinDate: (u?.createdAt || new Date().toISOString()).slice(0,10),
          totalWorkouts: 0,
          currentStreak: 0,
          longestStreak: 0,
          achievements: 0,
          thisWeekWorkouts: 0,
          thisMonthWorkouts: 0,
          age: u?.age || '',
          height: u?.height || '',
          weight: u?.weight || '',
          fitnessLevel: u?.fitnessLevel || 'beginner',
          primaryGoal: u?.primaryGoal || '',
          goals: u?.goals || [],
          workoutFrequency: u?.workoutFrequency || '',
          preferredWorkoutTime: u?.preferredWorkoutTime || '',
          availableEquipment: u?.availableEquipment || [],
          totalCaloriesBurned: '0',
          totalWorkoutTime: '0h',
          goalsCompleted: 0
        });
      }
    } catch (error) {
      setUser(null);
    }
  }, []);

  const handleSidebarToggle = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSidebarClose = () => setIsSidebarOpen(false);

  return (
    <div className="bento-root achievements-shell">
      {/* Ambient background trails */}
      <div className="trail trail-coral" style={{ width: 600, height: 600, top: '-5%', right: '10%', opacity: 0.08 }} />
      <div className="trail trail-olive" style={{ width: 500, height: 500, bottom: '10%', left: '-5%', opacity: 0.06 }} />

      <AppHeader
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
        user={user || { name: 'Mahmoud Ayman', email: '' }}
        onLogout={()=>{}}
      />
      <SidebarNavigation isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      
      <main className="pt-24 lg:pl-72 min-h-screen relative z-10">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">
          
          <div className="mb-8 sm:mb-10 px-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black m-0 tracking-tight" style={{ color: 'var(--bento-text)' }}>{t('achievements.title')}</h1>
            <p className="text-sm sm:text-base mt-1.5 font-medium" style={{ color: 'var(--bento-soft-text)' }}>{t('achievements.subtitle')}</p>
          </div>
          
          <div className="bento-card p-5 sm:p-8">
            {/* The inner component uses standard Tailwind classes, so we wrap it and it will blend in.
                We inject a small local style to override its internal bg-card to be transparent or match our bento theme. */}
            <style>{`
              .bento-card .bg-card {
                background: var(--bento-chip) !important;
                border-color: var(--bento-border) !important;
              }
              .bento-card .border-border {
                border-color: var(--bento-border) !important;
              }
              :root:not(.dark) .achievements-shell .text-white {
                color: #181818 !important;
              }
            `}</style>
            <AchievementsTab user={user} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AchievementsPage;
