import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const note = { id, type: 'info', duration: 5000, ...notification };
    setNotifications((prev) => {
      const next = [note, ...prev].slice(0, 4);
      return next;
    });
    if (note.duration > 0) {
      setTimeout(() => removeNotification(id), note.duration);
    }
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const { getHistory } = await import('../services/history');
      const data = await getHistory(6);
      setHistory(data);
    } catch (e) {
      // Backend may not be running yet — suppress noise in the console
    }
  }, []);

  // Load history once on app mount
  useEffect(() => { refreshHistory(); }, []);

  return (
    <AppContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        history,
        setHistory,
        refreshHistory,
        currentJob,
        setCurrentJob,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
