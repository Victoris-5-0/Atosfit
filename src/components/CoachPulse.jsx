import React from 'react';
import Icon from './AppIcon';

const CoachPulse = ({ title = 'ATOS Coach', note, actionLabel, tone = 'steady', compact = false, className = '' }) => {
  if (!note) return null;

  return (
    <div className={`coach-pulse coach-pulse-${tone} ${compact ? 'coach-pulse-compact' : ''} ${className}`}>
      <div className="coach-pulse-avatar" aria-hidden="true">
        <Icon name="Sparkles" size={17} />
      </div>
      <div className="coach-pulse-copy">
        <span>{title}</span>
        <p>{note}</p>
      </div>
      {actionLabel && <div className="coach-pulse-action">{actionLabel}</div>}
    </div>
  );
};

export default CoachPulse;
