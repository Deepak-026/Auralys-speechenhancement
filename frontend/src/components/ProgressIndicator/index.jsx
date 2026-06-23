import React, { useEffect, useState, useRef } from 'react';
import { PROCESSING_STAGES } from '../../utils/constants';
import { formatDuration } from '../../utils/formatDuration';
import ConfirmationDialog from '../ConfirmationDialog';

function CircularProgress({ percent }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="140" height="140" className="-rotate-90">
      <circle cx="70" cy="70" r={r} stroke="#2a2a3a" strokeWidth="8" fill="none" />
      <circle
        cx="70"
        cy="70"
        r={r}
        stroke="url(#progressGrad)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ProgressIndicator({ uploadProgress, status, onCancel }) {
  const [elapsed, setElapsed] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Advance stages based on elapsed time and upload progress
  useEffect(() => {
    if (status === 'uploading' && uploadProgress < 100) {
      setStageIndex(0);
    } else if (status === 'uploading' && uploadProgress >= 100) {
      setStageIndex(1);
    } else if (status === 'processing') {
      const s = Math.min(1 + Math.floor(elapsed / 8), 3);
      setStageIndex(s);
    }
  }, [status, uploadProgress, elapsed]);

  // Compute display progress
  let displayProgress = 0;
  if (status === 'uploading') {
    displayProgress = Math.round(uploadProgress * 0.2); // upload = first 20%
  } else if (status === 'processing') {
    displayProgress = 20 + Math.min(75, Math.floor(elapsed * 2));
  }
  displayProgress = Math.min(99, displayProgress);

  const estimatedTotal = 60;
  const remaining = Math.max(0, estimatedTotal - elapsed);

  return (
    <>
      <div className="card p-8 w-full max-w-md mx-auto text-center animate-fade-in">
        <h2 className="text-lg font-semibold text-white mb-8">Enhancing Your Audio…</h2>

        {/* Circular progress */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <CircularProgress percent={displayProgress} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white tabular-nums">{displayProgress}%</span>
            <span className="text-xs text-gray-500 mt-1">complete</span>
          </div>
        </div>

        {/* Stage indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow" />
          <span className="text-sm font-medium text-primary-400">
            {PROCESSING_STAGES[stageIndex]}
          </span>
        </div>

        {/* Stage progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {PROCESSING_STAGES.map((stage, i) => (
            <div
              key={stage}
              title={stage}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < stageIndex ? 'bg-primary-500 w-6' :
                i === stageIndex ? 'bg-primary-400 w-8 animate-pulse-slow' :
                'bg-surface-border w-4'
              }`}
            />
          ))}
        </div>

        {/* Time info */}
        <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider mb-0.5">Elapsed</p>
            <p className="font-mono text-white">{formatDuration(elapsed)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-0.5">Est. remaining</p>
            <p className="font-mono text-white">~{formatDuration(remaining)}</p>
          </div>
        </div>

        <button
          onClick={() => setShowCancel(true)}
          className="text-xs text-gray-500 hover:text-accent-red transition-colors"
        >
          Cancel Processing
        </button>
      </div>

      <ConfirmationDialog
        isOpen={showCancel}
        title="Cancel Processing?"
        message="The audio enhancement in progress will be stopped. You can start again with the same file."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Processing"
        variant="danger"
        onConfirm={() => { setShowCancel(false); onCancel?.(); }}
        onCancel={() => setShowCancel(false)}
      />
    </>
  );
}
