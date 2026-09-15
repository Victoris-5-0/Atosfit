import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import ExerciseCard from '../dashboard/components/ExerciseCard';
import Icon from '../../components/AppIcon';
import PresetPlans from './components/PresetPlans';
import WorkoutPlanBuilder from './components/WorkoutPlanBuilder';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/bento-dashboard.css';

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, beginner, intermediate, advanced
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('exercises'); // exercises, plans, create
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [customPlans, setCustomPlans] = useState([]);

  // Mock exercise data (same as dashboard)
  const exercises = [
    { id: 1, name: "Push-ups", targetMuscles: "Chest, Arms, Core", difficulty: "Beginner", duration: 8, caloriesBurn: 45, sets: 3, reps: 15, description: "Classic upper body exercise." },
    { id: 11, name: "Wide Push Ups", targetMuscles: "Chest (outer), Shoulders, Triceps", difficulty: "Intermediate", duration: 8, caloriesBurn: 50, sets: 3, reps: 12, description: "Wider hand placement." },
    { id: 16, name: "Straight Arm Plank", targetMuscles: "Core, Shoulders", difficulty: "Intermediate", duration: 8, caloriesBurn: 35, sets: 3, reps: "30s", description: "Isometric plank variation." },
    { id: 17, name: "Reverse Straight Arm Plank", targetMuscles: "Core, Posterior Chain", difficulty: "Intermediate", duration: 8, caloriesBurn: 35, sets: 3, reps: "30s", description: "Isometric plank variation." },
    { id: 18, name: "Knee Plank", targetMuscles: "Core, Shoulders", difficulty: "Beginner", duration: 6, caloriesBurn: 20, sets: 3, reps: "20s", description: "Modified plank." },
    { id: 12, name: "Narrow Push Ups", targetMuscles: "Chest (inner), Triceps, Core", difficulty: "Intermediate", duration: 8, caloriesBurn: 50, sets: 3, reps: 12, description: "Close-hand push-up." },
    { id: 13, name: "Diamond Push Ups", targetMuscles: "Triceps, Chest, Core", difficulty: "Advanced", duration: 8, caloriesBurn: 55, sets: 3, reps: 10, description: "Hands form a diamond." },
    { id: 14, name: "Knee Push Ups", targetMuscles: "Chest, Arms, Core", difficulty: "Beginner", duration: 6, caloriesBurn: 30, sets: 3, reps: 12, description: "Modified push-up." },
    { id: 2, name: "Squats", targetMuscles: "Legs, Glutes, Core", difficulty: "Beginner", duration: 10, caloriesBurn: 60, sets: 3, reps: 20, description: "Fundamental lower body movement." },
    { id: 3, name: "Lunges", targetMuscles: "Legs, Glutes, Balance", difficulty: "Intermediate", duration: 12, caloriesBurn: 70, sets: 3, reps: 12, description: "Unilateral leg exercise." },
    { id: 4, name: "Burpees", targetMuscles: "Full Body, Cardio", difficulty: "Advanced", duration: 15, caloriesBurn: 120, sets: 3, reps: 10, description: "High-intensity full-body exercise." },
    { id: 5, name: "Sit-Ups", targetMuscles: "Core, Abs", difficulty: "Intermediate", duration: 8, caloriesBurn: 80, sets: 3, reps: 20, description: "Dynamic core exercise." },
    { id: 6, name: "Jumping Jacks", targetMuscles: "Full Body, Cardio", difficulty: "Beginner", duration: 6, caloriesBurn: 50, sets: 3, reps: 30, description: "Classic cardio exercise." },
    { id: 7, name: "High Knees", targetMuscles: "Legs, Core, Cardio", difficulty: "Beginner", duration: 5, caloriesBurn: 40, sets: 3, reps: 25, description: "Running-in-place variation." },
    { id: 8, name: "Plank", targetMuscles: "Core, Shoulders, Back", difficulty: "Intermediate", duration: 10, caloriesBurn: 35, sets: 3, reps: "30s", description: "Isometric core exercise." },
    { id: 9, name: "Side Plank", targetMuscles: "Core, Obliques, Shoulders", difficulty: "Intermediate", duration: 8, caloriesBurn: 30, sets: 3, reps: "20s", description: "Lateral core strengthening." },
    { id: 19, name: "Reverse Plank", targetMuscles: "Core, Glutes, Hamstrings", difficulty: "Intermediate", duration: 8, caloriesBurn: 40, sets: 3, reps: "30s", description: "Strengthening posterior chain." },
    { id: 10, name: "Wall Sit", targetMuscles: "Legs, Glutes, Core", difficulty: "Beginner", duration: 7, caloriesBurn: 25, sets: 3, reps: "30s", description: "Isometric leg exercise." }
  ];

  useEffect(() => {
    const savedPlans = localStorage.getItem('atos_custom_plans');
    if (savedPlans) setCustomPlans(JSON.parse(savedPlans));
  }, []);

  const handleSavePlan = (plan) => {
    const updatedPlans = [...customPlans, plan];
    setCustomPlans(updatedPlans);
    localStorage.setItem('atos_custom_plans', JSON.stringify(updatedPlans));
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm(t('exercises.deletePlan'))) {
      const updatedPlans = customPlans.filter(plan => plan.id !== planId);
      setCustomPlans(updatedPlans);
      localStorage.setItem('atos_custom_plans', JSON.stringify(updatedPlans));
    }
  };

  const handleStartPlan = (plan) => {
    navigate('/exercise-workout-screen', { 
      state: { 
        selectedPlan: plan,
        todayPlan: {
          name: plan.name,
          exercises: plan.exercises.map(ex => ({
            name: ex.name, sets: ex.sets, reps: ex.reps, duration: ex.duration, completed: false
          }))
        }
      }
    });
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesFilter = filter === 'all' || exercise.difficulty.toLowerCase() === filter.toLowerCase();
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.targetMuscles.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const difficultyOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
  const sortedExercises = [...filteredExercises].sort((a, b) => 
    (difficultyOrder[a.difficulty] ?? 3) - (difficultyOrder[b.difficulty] ?? 3)
  );

  const getDifficultyCount = (difficulty) => exercises.filter(ex => ex.difficulty === difficulty).length;

  return (
    <div className="bento-root">
      <AppHeader
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        user={JSON.parse(localStorage.getItem('user') || '{}')}
      />
      
      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="pt-24 lg:pl-72 min-h-screen">
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--bento-text)', margin: 0, letterSpacing: '0' }}>{t('exercises.library')}</h1>
                <p style={{ color: 'var(--bento-soft-text)', fontSize: '1rem', marginTop: '0.25rem' }}>{t('exercises.intro')}</p>
              </div>
              <button className="btn-olive" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="ArrowLeft" size={16} /> {t('common.backToDashboard')}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bento-card" style={{ padding: '0.5rem', marginBottom: '2.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'exercises', label: t('exercises.exercises'), icon: 'Dumbbell' },
              { id: 'plans', label: t('exercises.presetPlans'), icon: 'Calendar' },
              { id: 'create', label: t('exercises.createPlan'), icon: 'Plus' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, minWidth: '140px', padding: '0.75rem 1.5rem', borderRadius: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.3s ease',
                  backgroundColor: activeTab === tab.id ? 'rgba(255, 138, 0,0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#FF8A00' : '#a7a289',
                  border: `1px solid ${activeTab === tab.id ? 'rgba(255, 138, 0,0.3)' : 'transparent'}`
                }}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content: EXERCISES */}
          {activeTab === 'exercises' && (
            <>
              {/* Search & Filter */}
              <div className="bento-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                  <Icon name="Search" size={20} color="var(--bento-soft-text)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder={t('exercises.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem',
                      backgroundColor: 'var(--bento-field)', border: '1px solid var(--bento-border)',
                      borderRadius: '16px', color: 'var(--bento-text)', fontSize: '0.95rem',
                      outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#FF8A00'}
                    onBlur={e => e.target.style.borderColor = 'var(--bento-border)'}
                  />
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {[
                    { id: 'all', label: `${t('exercises.all')} (${exercises.length})` },
                    { id: 'beginner', label: `${t('exercises.beginner')} (${getDifficultyCount('Beginner')})` },
                    { id: 'intermediate', label: `${t('exercises.intermediate')} (${getDifficultyCount('Intermediate')})` },
                    { id: 'advanced', label: `${t('exercises.advanced')} (${getDifficultyCount('Advanced')})` }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      style={{
                        padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
                        backgroundColor: filter === f.id ? 'var(--bento-chip)' : 'transparent',
                        color: filter === f.id ? 'var(--bento-text)' : 'var(--bento-soft-text)',
                        border: `1px solid ${filter === f.id ? 'var(--bento-border)' : 'transparent'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              {sortedExercises.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {sortedExercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              ) : (
                <div className="bento-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <Icon name="Search" size={48} color="rgba(167,162,137,0.4)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--bento-text)', fontWeight: 700, marginBottom: '0.5rem' }}>{t('exercises.noExercises')}</h3>
                  <p style={{ color: 'var(--bento-soft-text)', marginBottom: '1.5rem' }}>{t('exercises.adjustFilters')}</p>
                  <button className="btn-olive" onClick={() => { setSearchTerm(''); setFilter('all'); }}>{t('exercises.clearFilters')}</button>
                </div>
              )}
            </>
          )}

          {/* Tab Content: PLANS */}
          {activeTab === 'plans' && <PresetPlans onStartPlan={handleStartPlan} />}

          {/* Tab Content: CREATE */}
          {activeTab === 'create' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bento-text)', marginBottom: '0.5rem' }}>{t('exercises.createCustom')}</h2>
                <p style={{ color: 'var(--bento-soft-text)', fontSize: '1rem', marginBottom: '2rem' }}>{t('exercises.createCopy')}</p>
                <button className="btn-coral" style={{ padding: '1rem 2rem', fontSize: '1rem' }} onClick={() => setShowPlanBuilder(true)}>
                  <Icon name="Plus" size={20} color="#181818" /> {t('exercises.startBuilding')}
                </button>
              </div>

              {customPlans.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bento-text)', marginBottom: '1.5rem' }}>{t('exercises.customPlans')}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {customPlans.map((plan) => (
                      <div key={plan.id} className="bento-card" style={{ padding: '1.5rem', position: 'relative' }}>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--bento-soft-text)', cursor: 'pointer' }}
                          onMouseOver={e => e.currentTarget.style.color = '#FF8A00'}
                          onMouseOut={e => e.currentTarget.style.color = 'var(--bento-soft-text)'}
                        >
                          <Icon name="Trash2" size={18} />
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF8A00', boxShadow: '0 0 8px #FF8A00' }}></div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0, paddingRight: '2rem' }}>{plan.name}</h4>
                        </div>
                        
                        <p style={{ color: 'var(--bento-soft-text)', fontSize: '0.85rem', marginBottom: '1rem' }}>{plan.description}</p>
                        
                        <div style={{ display: 'inline-block', padding: '0.25rem 0.6rem', borderRadius: '999px', backgroundColor: 'var(--bento-chip)', color: 'var(--bento-text)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                          {t('exercises.planExercises', { count: plan.exercises.length })}
                        </div>

                        <button className="btn-coral" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleStartPlan(plan)}>
                          <Icon name="Play" size={16} color="#181818" /> {t('exercises.startPlan')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showPlanBuilder && (
            <WorkoutPlanBuilder
              exercises={exercises}
              onSavePlan={handleSavePlan}
              onClose={() => setShowPlanBuilder(false)}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default ExerciseLibrary;
