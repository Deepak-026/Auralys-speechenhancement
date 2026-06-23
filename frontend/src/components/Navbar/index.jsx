import React, { useState } from 'react';
import { Menu, Github, Bell, User, BookOpen, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { setSidebarOpen, sidebarOpen, notifications, removeNotification } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.length;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-surface-card/90 backdrop-blur-md
                       border-b border-surface-border flex items-center px-4 gap-4">
      {/* Left */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-elevated transition-all md:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Brand (mobile/collapsed) */}
      <div className="flex items-center gap-2 md:hidden">
        <img src="/logo.svg" alt="AURALYS" className="w-7 h-7" />
        <span className="font-bold text-white text-sm tracking-widest">AURALYS</span>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs hidden sm:flex items-center gap-1.5"
        >
          <BookOpen size={15} />
          Docs
        </a>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost p-2"
          aria-label="GitHub"
        >
          <Github size={18} />
        </a>

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="btn-ghost p-2 relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 card p-3 shadow-card z-50 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex gap-2 p-2.5 rounded-lg bg-surface-elevated text-xs"
                    >
                      <p className="flex-1 text-gray-300">{n.message}</p>
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="text-gray-500 hover:text-white flex-shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-surface-elevated border border-surface-border
                          flex items-center justify-center text-gray-400">
            <User size={16} />
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">Guest</span>
        </div>
      </div>
    </header>
  );
}
