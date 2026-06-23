import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function ErrorAlert({ message, type = 'error', onDismiss, className = '' }) {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  const isWarning = type === 'warning';
  const Icon = isWarning ? AlertTriangle : AlertCircle;
  const colorClass = isWarning
    ? 'border-accent-amber/40 bg-accent-amber/10 text-accent-amber'
    : 'border-accent-red/40 bg-accent-red/10 text-accent-red';

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${colorClass} ${className} animate-fade-in`}>
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm break-words">{message}</p>
      {onDismiss !== undefined && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
