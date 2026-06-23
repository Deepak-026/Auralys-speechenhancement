import { useState, useEffect, useCallback } from 'react';
import { getHistory, deleteHistoryEntry } from '../services/history';

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(6);
      setHistory(data);
    } catch (e) {
      setError(e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (id) => {
    try {
      await deleteHistoryEntry(id);
      setHistory((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (e) {
      console.error('Delete failed:', e);
      return false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { history, loading, error, refresh, deleteEntry };
}
