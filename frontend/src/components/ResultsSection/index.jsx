import React from 'react';
import {
  CheckCircle2, Clock, Cpu, HardDrive, Activity, Radio, ArrowRight, RotateCcw
} from 'lucide-react';
import AudioPlayer from '../AudioPlayer';
import DownloadButton from '../DownloadButton';
import { formatFileSize } from '../../utils/formatFileSize';
import { formatDuration } from '../../utils/formatDuration';

export default function ResultsSection({ result, onReset }) {
  if (!result) return null;

  const {
    jobId,
    originalUrl,
    enhancedUrl,
    enhancedDownloadUrl,
    inputMetadata,
    outputMetadata,
    processingTimeSeconds,
    modelUsed,
    snrImprovementDb,
  } = result;

  const stats = [
    {
      icon: Clock,
      label: 'Processing Time',
      value: processingTimeSeconds ? `${processingTimeSeconds.toFixed(1)}s` : '—',
    },
    {
      icon: Cpu,
      label: 'Model Used',
      value: modelUsed || '—',
    },
    {
      icon: HardDrive,
      label: 'Input Size',
      value: inputMetadata?.file_size_bytes ? formatFileSize(inputMetadata.file_size_bytes) : '—',
    },
    {
      icon: HardDrive,
      label: 'Output Size',
      value: outputMetadata?.file_size_bytes ? formatFileSize(outputMetadata.file_size_bytes) : '—',
    },
    {
      icon: Activity,
      label: 'SNR Improvement',
      value: snrImprovementDb !== undefined ? `~${snrImprovementDb} dB est.` : '—',
    },
    {
      icon: Radio,
      label: 'Sample Rate',
      value: outputMetadata?.sample_rate ? `${outputMetadata.sample_rate} Hz` : '—',
    },
    {
      icon: Clock,
      label: 'Duration',
      value: outputMetadata?.duration_seconds ? formatDuration(outputMetadata.duration_seconds) : '—',
    },
    {
      icon: CheckCircle2,
      label: 'Status',
      value: 'Enhanced',
      valueClass: 'text-accent-green',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-green/10 border border-accent-green/30">
        <CheckCircle2 size={20} className="text-accent-green flex-shrink-0" />
        <div>
          <p className="font-semibold text-white text-sm">Enhancement Complete!</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Your audio has been enhanced. Compare the results below and download the improved file.
          </p>
        </div>
      </div>

      {/* Audio comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <h3 className="text-sm font-semibold text-gray-300">Original Audio</h3>
          </div>
          <AudioPlayer src={originalUrl} />
          {inputMetadata && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              {inputMetadata.filename} · {formatFileSize(inputMetadata.file_size_bytes)}
            </p>
          )}
        </div>

        <div className="card p-4 border-primary-500/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse-slow" />
            <h3 className="text-sm font-semibold text-white">Enhanced Audio</h3>
            <ArrowRight size={14} className="text-accent-green" />
          </div>
          <AudioPlayer src={enhancedUrl} />
          {outputMetadata && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              {outputMetadata.filename} · {formatFileSize(outputMetadata.file_size_bytes)}
            </p>
          )}
        </div>
      </div>

      {/* Enhancement stats */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Enhancement Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ icon: Icon, label, value, valueClass }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-gray-500" />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p className={`text-sm font-semibold ${valueClass || 'text-white'} truncate`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <DownloadButton
          jobId={jobId}
          filename={outputMetadata?.filename}
          className="flex-1 sm:flex-none"
        />
        <button
          onClick={onReset}
          className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none justify-center"
        >
          <RotateCcw size={16} />
          Process Another File
        </button>
        <button
          disabled
          title="Coming soon"
          className="btn-ghost flex items-center gap-2 opacity-40 cursor-not-allowed flex-1 sm:flex-none justify-center"
        >
          Share Result (Soon)
        </button>
      </div>
    </div>
  );
}
