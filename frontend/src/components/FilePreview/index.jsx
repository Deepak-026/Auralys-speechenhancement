import React, { useEffect, useState } from 'react';
import { X, FileAudio, Clock, HardDrive, Radio, Cpu } from 'lucide-react';
import AudioPlayer from '../AudioPlayer';
import { formatFileSize } from '../../utils/formatFileSize';
import { formatDuration } from '../../utils/formatDuration';

function FormatBadge({ format }) {
  const colors = {
    WAV: 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10',
    MP3: 'text-accent-green border-accent-green/30 bg-accent-green/10',
    OPUS: 'text-accent-purple border-accent-purple/30 bg-accent-purple/10',
  };
  const color = colors[format?.toUpperCase()] || 'text-gray-400 border-surface-border bg-surface-elevated';
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      {format?.toUpperCase() || 'AUDIO'}
    </span>
  );
}

export default function FilePreview({ file, previewUrl, onRemove }) {
  const [audioDuration, setAudioDuration] = useState(null);
  const ext = file?.name?.split('.').pop()?.toUpperCase() || '';

  useEffect(() => {
    if (!previewUrl) return;
    const audio = new Audio(previewUrl);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
  }, [previewUrl]);

  if (!file) return null;

  const uploadedAt = new Date().toLocaleString();

  return (
    <div className="card p-5 w-full max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border
                          flex items-center justify-center flex-shrink-0">
            <FileAudio size={20} className="text-primary-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate text-sm">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">Original Recording</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <FormatBadge format={ext} />
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-elevated rounded-lg transition-all"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <MetaStat icon={HardDrive} label="File Size" value={formatFileSize(file.size)} />
        <MetaStat icon={Clock} label="Duration" value={audioDuration ? formatDuration(audioDuration) : '—'} />
        <MetaStat icon={Radio} label="Format" value={ext || '—'} />
        <MetaStat icon={Cpu} label="Type" value="Audio File" />
        <MetaStat icon={Clock} label="Uploaded" value={uploadedAt} />
      </div>

      {/* Audio player */}
      {previewUrl && (
        <AudioPlayer src={previewUrl} label="Preview Original" />
      )}
    </div>
  );
}

function MetaStat({ icon: Icon, label, value }) {
  return (
    <div className="stat-card flex items-center gap-2">
      <Icon size={14} className="text-gray-500 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs font-medium text-white truncate">{value}</p>
      </div>
    </div>
  );
}
