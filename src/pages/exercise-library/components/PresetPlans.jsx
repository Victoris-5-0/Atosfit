import React from 'react';
import Icon from '../../../components/AppIcon';

const PresetPlans = ({ onStartPlan }) => {
  const presetPlans = [
    {
      id: 'lower-body',
      name: 'Lower Body Strength',
      description: 'Build strong legs and glutes with this comprehensive lower body workout',
      difficulty: 'Intermediate',
      duration: '45 mins',
      exercises: [
        { name: 'Squats', sets: 4, reps: 15, rest: '60s' },
        { name: 'Lunges', sets: 3, reps: 12, rest: '45s' },
        { name: 'Wall Sit', sets: 3, reps: '45s', rest: '60s' },
        { name: 'Jumping Jacks', sets: 3, reps: 30, rest: '30s' },
        { name: 'High Knees', sets: 3, reps: 25, rest: '30s' }
      ],
      targetMuscles: 'Legs, Glutes',
      calories: 350,
      color: '#a7a289' // Olive theme
    },
    {
      id: 'upper-body',
      name: 'Upper Body Power',
      description: 'Develop chest, arms, and shoulders with this upper body focused routine',
      difficulty: 'Intermediate',
      duration: '40 mins',
      exercises: [
        { name: 'Push-ups', sets: 4, reps: 15, rest: '60s' },
        { name: 'Wide Push Ups', sets: 3, reps: 12, rest: '45s' },
        { name: 'Narrow Push Ups', sets: 3, reps: 10, rest: '45s' },
        { name: 'Diamond Push Ups', sets: 3, reps: 8, rest: '60s' },
        { name: 'Plank', sets: 3, reps: '45s', rest: '60s' }
      ],
      targetMuscles: 'Chest, Arms',
      calories: 300,
      color: '#FF8A00' // Coral theme
    },
    {
      id: 'core-focused',
      name: 'Core Crusher',
      description: 'Strengthen your entire core with this intensive ab and stability workout',
      difficulty: 'Advanced',
      duration: '35 mins',
      exercises: [
        { name: 'Plank', sets: 4, reps: '60s', rest: '45s' },
        { name: 'Side Plank', sets: 3, reps: '30s each', rest: '30s' },
        { name: 'Sit-Ups', sets: 4, reps: 20, rest: '45s' },
        { name: 'Straight Arm Plank', sets: 3, reps: '45s', rest: '60s' },
        { name: 'Reverse Plank', sets: 3, reps: '30s', rest: '45s' }
      ],
      targetMuscles: 'Core, Abs',
      calories: 280,
      color: '#FF8A00'
    },
    {
      id: 'full-body',
      name: 'Full Body Blast',
      description: 'Complete full-body workout targeting all major muscle groups',
      difficulty: 'Advanced',
      duration: '50 mins',
      exercises: [
        { name: 'Burpees', sets: 4, reps: 12, rest: '90s' },
        { name: 'Squats', sets: 3, reps: 20, rest: '60s' },
        { name: 'Push-ups', sets: 3, reps: 15, rest: '60s' },
        { name: 'Lunges', sets: 3, reps: 12, rest: '45s' },
        { name: 'Plank', sets: 3, reps: '45s', rest: '60s' },
        { name: 'Jumping Jacks', sets: 3, reps: 30, rest: '30s' }
      ],
      targetMuscles: 'Full Body',
      calories: 450,
      color: '#FF8A00'
    },
    {
      id: 'beginner-friendly',
      name: 'Beginner Foundation',
      description: 'Perfect starting point for fitness beginners with modified exercises',
      difficulty: 'Beginner',
      duration: '30 mins',
      exercises: [
        { name: 'Knee Push Ups', sets: 3, reps: 10, rest: '60s' },
        { name: 'Wall Sit', sets: 3, reps: '30s', rest: '60s' },
        { name: 'Knee Plank', sets: 3, reps: '20s', rest: '45s' },
        { name: 'Jumping Jacks', sets: 3, reps: 20, rest: '30s' },
        { name: 'High Knees', sets: 3, reps: 15, rest: '30s' }
      ],
      targetMuscles: 'Full Body',
      calories: 200,
      color: '#a7a289'
    },
    {
      id: 'cardio-intense',
      name: 'Cardio Challenge',
      description: 'High-intensity cardio workout to boost endurance and burn calories',
      difficulty: 'Advanced',
      duration: '25 mins',
      exercises: [
        { name: 'Burpees', sets: 5, reps: 15, rest: '60s' },
        { name: 'Jumping Jacks', sets: 4, reps: 40, rest: '30s' },
        { name: 'High Knees', sets: 4, reps: 30, rest: '30s' },
        { name: 'Mountain Climbers', sets: 3, reps: 20, rest: '45s' }
      ],
      targetMuscles: 'Cardio',
      calories: 400,
      color: '#FF8A00'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return { bg: 'rgba(167,162,137,0.15)', text: '#a7a289', border: 'rgba(167,162,137,0.3)' };
      case 'Intermediate': return { bg: 'rgba(255, 138, 0,0.1)', text: '#FF8A00', border: 'rgba(255, 138, 0,0.25)' };
      case 'Advanced': return { bg: 'rgba(255, 138, 0,0.2)', text: '#FF8A00', border: 'rgba(255, 138, 0,0.4)' };
      default: return { bg: 'rgba(167,162,137,0.1)', text: '#a7a289', border: 'rgba(167,162,137,0.2)' };
    }
  };

  const PlanCard = ({ plan }) => {
    const diffColors = getDifficultyColor(plan.difficulty);

    return (
      <div className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: plan.color, boxShadow: `0 0 8px ${plan.color}` }}></div>
              <h3 style={{ fontWeight: 800, color: 'var(--bento-text)', fontSize: '1.2rem', margin: 0 }}>{plan.name}</h3>
            </div>
            <p style={{ color: 'var(--bento-soft-text)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{plan.description}</p>
          </div>
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.6rem', 
            borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', 
            letterSpacing: '0.05em', backgroundColor: diffColors.bg, color: diffColors.text, border: `1px solid ${diffColors.border}` 
          }}>
            {plan.difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--bento-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bento-text)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Icon name="Clock" size={14} color="#FF8A00" />
            {plan.duration}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bento-text)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Icon name="Zap" size={14} color="#FF8A00" />
            {plan.calories} cal
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bento-text)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Icon name="Target" size={14} color="#FF8A00" />
            {plan.targetMuscles}
          </div>
        </div>

        <div style={{ flex: 1, marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--bento-text)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Exercises ({plan.exercises.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plan.exercises.slice(0, 3).map((exercise, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--bento-soft-text)', fontWeight: 500 }}>{exercise.name}</span>
                <span style={{ color: 'var(--bento-text)', fontWeight: 600, background: 'var(--bento-chip)', padding: '2px 8px', borderRadius: '4px' }}>
                  {exercise.sets} × {exercise.reps}
                </span>
              </div>
            ))}
            {plan.exercises.length > 3 && (
              <div style={{ color: '#FF8A00', fontSize: '0.75rem', fontWeight: 700, marginTop: '4px' }}>
                +{plan.exercises.length - 3} more exercises
              </div>
            )}
          </div>
        </div>

        <button 
          className="btn-coral" 
          style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
          onClick={() => onStartPlan(plan)}
        >
          <Icon name="Play" size={16} color="#181818" />
          Start Plan
        </button>
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--bento-text)', marginBottom: '0.5rem' }}>Preset Workout Plans</h2>
        <p style={{ color: 'var(--bento-soft-text)', fontSize: '0.95rem' }}>Choose from our professionally designed workout plans</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '20px' 
      }}>
        {presetPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};

export default PresetPlans;
