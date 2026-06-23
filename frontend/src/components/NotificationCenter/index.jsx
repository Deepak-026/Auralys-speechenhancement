import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'border-accent-green/40 bg-accent-green/10 text-accent-green',
  error: 'border-accent-red/40 bg-accent-red/10 text-accent-red',
  warning: 'border-accent-amber/40 bg-accent-amber/10 text-accent-amber',
  info: 'border-primary-500/40 bg-primary-500/10 text-primary-400',
};

function Toast({ notification, onDismiss }) {
  const Icon = ICONS[notification.type] || Info;
  const colorClass = COLORS[notification.type] || COLORS.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
                  shadow-card animate-fade-in max-w-sm w-full ${colorClass}`}
    >
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className="font-semibold text-sm mb-0.5">{notification.title}</p>
        )}
        <p className="text-sm opacity-90 break-words">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function NotificationCenter() {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <Toast notification={n} onDismiss={removeNotification} />
        </div>
      ))}
    </div>
  );
}
