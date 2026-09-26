import React from 'react';

export function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="tm-empty-state">
      {Icon && (
        <div className="tm-empty-icon">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="tm-empty-title">{title}</h3>
      {description && <p className="tm-empty-description">{description}</p>}
      {actionText && onAction && (
        <button type="button" className="tm-btn tm-btn-secondary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
