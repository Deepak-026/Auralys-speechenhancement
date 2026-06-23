import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { MODELS, NOISE_LEVELS, OUTPUT_FORMATS } from '../../utils/constants';

export default function SettingsPanel({ settings, onChange, onEnhance, disabled }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (key, value) => onChange({ [key]: value });

  return (
    <div className="card p-5 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Sliders size={18} className="text-primary-400" />
        <h2 className="font-semibold text-white">Enhancement Settings</h2>
      </div>

      {/* Model selector */}
      <div className="mb-5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
          Enhancement Model
        </label>
        {MODELS.map((m) => (
          <label
            key={m.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200
                         ${settings.model === m.id
                           ? 'border-primary-500/60 bg-primary-600/10'
                           : 'border-surface-border hover:border-surface-elevated'
                         }`}
          >
            <input
              type="radio"
              name="model"
              value={m.id}
              checked={settings.model === m.id}
              onChange={() => set('model', m.id)}
              className="mt-0.5 accent-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-white">{m.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Noise Reduction */}
      <div className="mb-5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
          Noise Reduction Intensity
        </label>
        <div className="grid grid-cols-4 gap-2">
          {NOISE_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => set('noiseReduction', level.id)}
              className={`py-2 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-95
                           ${settings.noiseReduction === level.id
                             ? 'bg-primary-600 border-primary-500 text-white shadow-glow-sm'
                             : 'bg-surface-elevated border-surface-border text-gray-400 hover:text-white hover:border-primary-700'
                           }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output Format */}
      <div className="mb-5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
          Output Format
        </label>
        <select
          value={settings.outputFormat}
          onChange={(e) => set('outputFormat', e.target.value)}
          className="input-field"
          disabled
        >
          {OUTPUT_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Advanced Settings toggle */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-4"
      >
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
      </button>

      {showAdvanced && (
        <div className="border border-surface-border rounded-xl p-4 mb-5 space-y-4 animate-fade-in">
          <ToggleSetting
            label="Preserve Sample Rate"
            description="Keep original sample rate in output"
            value={settings.preserveSampleRate}
            onChange={(v) => set('preserveSampleRate', v)}
          />
          <ToggleSetting
            label="Output Normalization"
            description="Apply loudness normalization to output"
            value={settings.outputNormalization}
            onChange={(v) => set('outputNormalization', v)}
          />
          <SliderSetting
            label="Speech Preservation"
            description="Higher values preserve more speech characteristics"
            value={settings.speechPreservation}
            onChange={(v) => set('speechPreservation', v)}
          />
          <SliderSetting
            label="Denoising Aggressiveness"
            description="Higher values remove more noise (may affect speech quality)"
            value={settings.denoisingAggressiveness}
            onChange={(v) => set('denoisingAggressiveness', v)}
          />
        </div>
      )}

      {/* Enhance button */}
      <button
        onClick={onEnhance}
        disabled={disabled}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
      >
        <Zap size={20} />
        Enhance Speech
      </button>
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                     ${value ? 'bg-primary-600' : 'bg-surface-border'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                       ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

function SliderSetting({ label, description, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <span className="text-xs font-mono text-primary-400">{value}%</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1.5 accent-primary-500 cursor-pointer"
      />
    </div>
  );
}
