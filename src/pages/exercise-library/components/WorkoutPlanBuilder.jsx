import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const WorkoutPlanBuilder = ({ exercises, onSavePlan, onClose }) => {
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredExercises = exercises.filter(exercise => {
    const matchesFilter = filter === 'all' || exercise.difficulty.toLowerCase() === filter.toLowerCase();
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.targetMuscles.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const addExercise = (exercise) => {
    if (!selectedExercises.find(ex => ex.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, { ...exercise, sets: 3, reps: exercise.reps }]);
    }
  };

  const removeExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExercise = (exerciseId, field, value) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const savePlan = () => {
    if (!planName.trim() || selectedExercises.length === 0) {
      alert('Please provide a plan name and select at least one exercise');
      return;
    }

    const plan = {
      id: Date.now(),
      name: planName,
      description: planDescription,
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
      type: 'custom',
      difficulty: 'Custom',
      duration: `${selectedExercises.length * 8} mins`,
      targetMuscles: 'Custom',
      calories: selectedExercises.length * 40,
      color: '#FF8A00'
    };

    onSavePlan(plan);
    onClose();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return { bg: 'rgba(167,162,137,0.15)', text: '#a7a289', border: 'rgba(167,162,137,0.3)' };
      case 'Intermediate': return { bg: 'rgba(255, 138, 0,0.1)', text: '#FF8A00', border: 'rgba(255, 138, 0,0.25)' };
      case 'Advanced': return { bg: 'rgba(255, 138, 0,0.2)', text: '#FF8A00', border: 'rgba(255, 138, 0,0.4)' };
      default: return { bg: 'rgba(167,162,137,0.1)', text: '#a7a289', border: 'rgba(167,162,137,0.2)' };
    }
  };

  // Modern input styles
  const inputStyles = {
    width: '100%',
    padding: '0.8rem 1rem',
    backgroundColor: 'var(--bento-field)',
    border: '1px solid var(--bento-border)',
    borderRadius: '12px',
    color: 'var(--bento-text)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputFocusStyles = (e) => {
    e.target.style.borderColor = '#FF8A00';
    e.target.style.boxShadow = '0 0 0 2px rgba(255, 138, 0,0.1)';
  };

  const inputBlurStyles = (e) => {
    e.target.style.borderColor = 'var(--bento-border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="workout-builder-overlay">
      <div 
        className="bento-card workout-builder-sheet"
        style={{ 
          width: '100%', 
          maxWidth: '800px', 
          height: '100%', 
          borderRadius: '26px 0 0 26px', 
          borderRight: 'none',
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          animation: 'slide-in-right 0.3s ease-out'
        }}
      >
        <style>{`
          @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          /* Custom scrollbar for builder */
          .builder-scroll::-webkit-scrollbar { width: 6px; }
          .builder-scroll::-webkit-scrollbar-track { background: transparent; }
          .builder-scroll::-webkit-scrollbar-thumb { background: rgba(167,162,137,0.2); border-radius: 10px; }
          .builder-scroll::-webkit-scrollbar-thumb:hover { background: rgba(167,162,137,0.4); }
        `}</style>

        {/* Header */}
        <div className="workout-builder-header" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--bento-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bento-card-strong)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0 }}>Create Workout Plan</h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '50%', color: 'var(--bento-soft-text)' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bento-chip)'; e.currentTarget.style.color = 'var(--bento-text)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--bento-soft-text)'; }}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="builder-scroll workout-builder-body" style={{ padding: '2rem', flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left Col: Details & Selected */}
          <div className="workout-builder-details" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--bento-text)', marginBottom: '1rem' }}>Plan Details</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--bento-soft-text)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g., My Upper Body Plan"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  style={inputStyles}
                  onFocus={inputFocusStyles}
                  onBlur={inputBlurStyles}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--bento-soft-text)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                <textarea
                  placeholder="Describe your workout plan..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  rows={3}
                  style={{ ...inputStyles, resize: 'none', fontFamily: 'inherit' }}
                  onFocus={inputFocusStyles}
                  onBlur={inputBlurStyles}
                />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--bento-text)', marginBottom: '1rem' }}>
                Selected Exercises <span style={{ color: '#FF8A00' }}>({selectedExercises.length})</span>
              </h3>
              
              {selectedExercises.length === 0 ? (
                <div className="workout-builder-empty" style={{ padding: '2rem', border: '1px dashed rgba(167,162,137,0.3)', borderRadius: '12px', textAlign: 'center' }}>
                  <Icon name="Dumbbell" size={24} color="rgba(167,162,137,0.5)" />
                  <p style={{ color: 'var(--bento-soft-text)', fontSize: '0.9rem', marginTop: '0.5rem' }}>No exercises selected yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedExercises.map((exercise) => (
                    <div key={exercise.id} style={{ padding: '1rem', backgroundColor: 'var(--bento-chip)', borderRadius: '12px', border: '1px solid var(--bento-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h4 style={{ color: 'var(--bento-text)', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{exercise.name}</h4>
                        <button 
                          onClick={() => removeExercise(exercise.id)}
                          style={{ background: 'transparent', border: 'none', color: 'rgba(255, 138, 0,0.7)', cursor: 'pointer', padding: '4px' }}
                          onMouseOver={e => e.currentTarget.style.color = '#FF8A00'}
                          onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 138, 0,0.7)'}
                        >
                          <Icon name="X" size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--bento-soft-text)', textTransform: 'uppercase' }}>Sets</label>
                          <input
                            type="number" min="1" max="10"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                            style={{ ...inputStyles, padding: '0.5rem 0.75rem', marginTop: '4px' }}
                            onFocus={inputFocusStyles} onBlur={inputBlurStyles}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--bento-soft-text)', textTransform: 'uppercase' }}>Reps / Time</label>
                          <input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                            style={{ ...inputStyles, padding: '0.5rem 0.75rem', marginTop: '4px' }}
                            placeholder="15 or 30s"
                            onFocus={inputFocusStyles} onBlur={inputBlurStyles}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Exercise Library */}
          <div className="workout-builder-library" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--bento-text)', marginBottom: '1rem' }}>Library</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <Icon name="Search" size={18} color="var(--bento-soft-text)" />
                </div>
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyles, paddingLeft: '38px' }}
                  onFocus={inputFocusStyles} onBlur={inputBlurStyles}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      background: filter === f ? 'rgba(255, 138, 0,0.15)' : 'transparent',
                      color: filter === f ? '#FF8A00' : 'var(--bento-soft-text)',
                      border: `1px solid ${filter === f ? '#FF8A00' : 'rgba(167,162,137,0.3)'}`,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="builder-scroll workout-builder-library-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}>
              {filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
                const diffColors = getDifficultyColor(exercise.difficulty);
                
                return (
                  <div key={exercise.id} style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    backgroundColor: isSelected ? 'rgba(255, 138, 0,0.08)' : 'var(--bento-chip)',
                    border: `1px solid ${isSelected ? 'rgba(255, 138, 0,0.2)' : 'var(--bento-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h4 style={{ color: 'var(--bento-text)', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 4px 0' }}>{exercise.name}</h4>
                      <p style={{ color: 'var(--bento-soft-text)', fontSize: '0.75rem', margin: '0 0 8px 0' }}>{exercise.targetMuscles}</p>
                      <span style={{ 
                        fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                        backgroundColor: diffColors.bg, color: diffColors.text 
                      }}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => !isSelected && addExercise(exercise)}
                      disabled={isSelected}
                      style={{
                        background: isSelected ? 'transparent' : 'rgba(255, 138, 0,0.1)',
                        color: isSelected ? 'var(--bento-soft-text)' : '#FF8A00',
                        border: `1px solid ${isSelected ? 'transparent' : 'rgba(255, 138, 0,0.3)'}`,
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: isSelected ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => !isSelected && (e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0,0.2)')}
                      onMouseOut={e => !isSelected && (e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0,0.1)')}
                    >
                      {isSelected ? <Icon name="Check" size={16} /> : <Icon name="Plus" size={16} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="workout-builder-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--bento-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--bento-card-strong)' }}>
          <button className="btn-olive" onClick={onClose} style={{ padding: '0.7rem 1.5rem' }}>
            Cancel
          </button>
          <button 
            className="btn-coral" 
            onClick={savePlan} 
            disabled={!planName.trim() || selectedExercises.length === 0}
            style={{ 
              padding: '0.7rem 1.5rem', 
              opacity: (!planName.trim() || selectedExercises.length === 0) ? 0.5 : 1,
              cursor: (!planName.trim() || selectedExercises.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanBuilder;
