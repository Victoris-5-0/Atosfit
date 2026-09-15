import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../contexts/LanguageContext';

const ExerciseCard = ({ exercise }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isTimeBased = useMemo(() => {
    const timeNames = new Set([
      'Mountain Climbers',
      'Jumping Jacks',
      'High Knees',
      'Plank',
      'Side Plank',
      'Wall Sit'
    ]);
    return timeNames.has(exercise?.name) || typeof exercise?.reps === 'string';
  }, [exercise]);

  const handleStartWorkout = () => {
    navigate('/exercise-workout-screen', { state: { selectedExercise: exercise } });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return { bg: 'rgba(167,162,137,0.15)', text: '#a7a289', border: 'rgba(167,162,137,0.3)' };
      case 'Intermediate': return { bg: 'rgba(255, 138, 0,0.1)', text: '#FF8A00', border: 'rgba(255, 138, 0,0.25)' };
      case 'Advanced': return { bg: 'rgba(255, 138, 0,0.2)', text: '#FF8A00', border: 'rgba(255, 138, 0,0.4)' };
      default: return { bg: 'rgba(167,162,137,0.1)', text: '#a7a289', border: 'rgba(167,162,137,0.2)' };
    }
  };

  const photoMap = {
    'Push-ups': 'https://i.pinimg.com/originals/47/0d/31/470d318a551421e46c3891fb1f04dd50.gif',
    'Push Ups': 'https://i.pinimg.com/originals/47/0d/31/470d318a551421e46c3891fb1f04dd50.gif',
    'Squats': 'https://i.pinimg.com/originals/27/30/c2/2730c2da52a5f9200caa7e5d8705efde.gif',
    'Lunges': 'https://i.pinimg.com/originals/66/78/58/6678589817d6026fab7bd23838a8e3eb.gif',
    'Burpees': 'https://i.pinimg.com/originals/f0/a3/da/f0a3da2890f6edf4c7b45845fa14e39c.gif',
    'Mountain Climbers': 'https://i.pinimg.com/originals/bd/f2/a3/bdf2a3ec9beb4f231033af0d744057bb.gif',
    'Jumping Jacks': 'https://i.pinimg.com/originals/b4/b5/b9/b4b5b94c119dde698d138b8fe0b8d521.gif',
    'High Knees': 'https://i.pinimg.com/originals/95/db/ae/95dbae82f51c67fc0f5aa30a57da663c.gif',
    'Plank': 'https://i.pinimg.com/736x/83/84/65/83846529c8c33a1d03b493c82bb23570.jpg',
    'Side Plank': 'https://i.pinimg.com/736x/bd/cf/9a/bdcf9a908f66c3f28a47adc08a6c8448.jpg',
    'Wall Sit': 'https://i.pinimg.com/originals/50/bb/fa/50bbfa9d11ce94feff442ad0c1a3e250.gif',
    'Knee Plank': 'https://i.pinimg.com/originals/8d/51/1e/8d511edb34e36c468aef1027f7642621.gif',
    'Knee Push Ups': 'https://i.pinimg.com/originals/f6/20/c9/f620c92cf9f2631338f51f711669d320.gif',
    'Sit Ups': 'https://i.pinimg.com/originals/53/05/a5/5305a5d4e53c24604ccdc1c1ba564561.gif',
    'Reverse Straight Arm Plank': 'https://i.pinimg.com/736x/37/ca/7e/37ca7ebf394ecc3df96f3c2c700f9738.jpg',
    'Straight Arm Plank': 'https://i.pinimg.com/736x/d2/42/af/d242af1590d71c24ab930d6588f710d3.jpg',
    'Reverse Plank': 'https://i.pinimg.com/736x/f4/1e/0f/f41e0f356b1cd9202ad0dda957cee97a.jpg',
    'Wide Push Ups': 'https://i.pinimg.com/originals/47/0d/31/470d318a551421e46c3891fb1f04dd50.gif',
    'Narrow Push Ups': 'https://i.pinimg.com/originals/47/0d/31/470d318a551421e46c3891fb1f04dd50.gif',
    'Diamond Push Ups': 'https://i.pinimg.com/originals/47/0d/31/470d318a551421e46c3891fb1f04dd50.gif',
  };

  const normalize = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalized = normalize(exercise?.name);
  const normalizedPhotoMap = Object.keys(photoMap).reduce((acc, key) => {
    acc[normalize(key)] = photoMap[key];
    return acc;
  }, {});
  const photoFile = normalizedPhotoMap[normalized] || null;
  const diffColors = getDifficultyColor(exercise?.difficulty);
  const difficultyLabel = t(`exercises.${String(exercise?.difficulty || '').toLowerCase()}`);

  return (
    <div className="bento-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1rem', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
        <img
          src={
            photoFile && (photoFile.startsWith('http') ? photoFile : `/assets/photos/${photoFile}`)
            || '/assets/images/no_image.png'
          }
          alt={exercise?.name}
          style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#fff' }}
          loading="lazy"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.75rem' }}>
        <h3 style={{ fontWeight: 800, color: 'var(--bento-text)', fontSize: '1.15rem', margin: 0, lineHeight: 1.2 }}>
          {exercise?.name}
        </h3>
        <span style={{ 
          display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.6rem', 
          borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', 
          letterSpacing: '0.05em', backgroundColor: diffColors.bg, color: diffColors.text, border: `1px solid ${diffColors.border}` 
        }}>
          {difficultyLabel.startsWith('exercises.') ? exercise?.difficulty : difficultyLabel}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--bento-soft-text)', fontWeight: 500, marginBottom: '1.25rem', flex: 1 }}>
        {exercise?.targetMuscles}
      </p>

      <button 
        className="btn-coral" 
        style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
        onClick={handleStartWorkout}
      >
        <Icon name="Play" size={16} color="#181818" />
        {t('dashboard.startWorkout')}
      </button>
    </div>
  );
};

export default ExerciseCard;
