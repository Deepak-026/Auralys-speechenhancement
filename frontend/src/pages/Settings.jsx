import React, { useState } from 'react';
import { Settings as SettingsIcon, Trash2, Moon } from 'lucide-react';
import { MODELS, NOISE_LEVELS } from '../utils/constants';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useApp } from '../context/AppContext';
import api from '../services/api';

export default function Settings() {
  const { addNotification, refreshHistory } = useApp();
  const [defaultModel, setDefaultModel] = useState('sepformer-wham16k');
  const [defaultNoise, setDefaultNoise] = useState('auto');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearHistory = async () => {
    try {
      const history = await api.get('/history').then(r => r.data.history);
      await Promise.all(history.map((e) => api.delete(`/history/${e.id}`)));
      await refreshHistory();
      addNotification({ type: 'success', message: 'History cleared successfully.' });
    } catch {
      addNotification({ type: 'error', message: 'Failed to clear history.' });
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30
                        flex items-center justify-center">
          <SettingsIcon size={20} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400">Configure your AURALYS preferences</p>
        </div>
      </div>

      {/* Default model */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4 text-sm">Default Enhancement Model</h2>
        {MODELS.map((m) => (
          <label key={m.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer
                                         hover:bg-surface-elevated transition-colors">
            <input
              type="radio"
              name="defaultModel"
              value={m.id}
              checked={defaultModel === m.id}
              onChange={() => setDefaultModel(m.id)}
              className="accent-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-white">{m.name}</p>
              <p className="text-xs text-gray-500">{m.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Default noise level */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4 text-sm">Default Noise Reduction Level</h2>
        <div className="grid grid-cols-4 gap-2">
          {NOISE_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setDefaultNoise(level.id)}
              className={`py-2 rounded-xl text-sm font-medium border transition-all duration-200
                           ${defaultNoise === level.id
                             ? 'bg-primary-600 border-primary-500 text-white'
                             : 'bg-surface-elevated border-surface-border text-gray-400 hover:text-white'
                           }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4 text-sm">Appearance</h2>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated">
          <Moon size={18} className="text-primary-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Dark Mode</p>
            <p className="text-xs text-gray-500">Currently the only supported theme</p>
          </div>
          <div className="w-11 h-6 rounded-full bg-primary-600 relative">
            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-5 border-accent-red/20">
        <h2 className="font-semibold text-accent-red mb-4 text-sm">Danger Zone</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Clear Enhancement History</p>
            <p className="text-xs text-gray-500 mt-0.5">Remove all history entries and delete output files</p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-red/20 border border-accent-red/30
                       text-accent-red text-sm font-medium hover:bg-accent-red/30 transition-all duration-200"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showClearConfirm}
        title="Clear All History?"
        message="This will permanently delete all history entries and their associated enhanced audio files. This cannot be undone."
        confirmLabel="Clear History"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
