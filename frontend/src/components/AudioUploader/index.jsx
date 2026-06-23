import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileAudio } from 'lucide-react';
import { validateAudioFile } from '../../utils/validators';
import ErrorAlert from '../ErrorAlert';

const FORMATS = ['WAV', 'MP3', 'OPUS'];

export default function AudioUploader({ onFileSelect }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const processFile = useCallback((file) => {
    setValidationError(null);
    const { valid, error } = validateAudioFile(file);
    if (!valid) {
      setValidationError(error);
      return;
    }
    onFileSelect?.(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragging(false);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }, [processFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {validationError && (
        <ErrorAlert
          message={validationError}
          onDismiss={() => setValidationError(null)}
          className="mb-4"
        />
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-5 p-12 rounded-2xl
                    border-2 border-dashed cursor-pointer transition-all duration-300
                    ${dragging
                      ? 'border-primary-500 bg-primary-500/10 scale-[1.01] shadow-glow'
                      : 'border-surface-border hover:border-primary-600/60 hover:bg-surface-elevated/50'
                    }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".wav,.mp3,.opus"
          className="hidden"
          onChange={handleInputChange}
        />

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                         ${dragging ? 'bg-primary-600/30 scale-110' : 'bg-surface-elevated'}`}>
          {dragging ? (
            <FileAudio size={28} className="text-primary-400" />
          ) : (
            <Upload size={28} className="text-gray-400" />
          )}
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">
            {dragging ? 'Drop your audio file here' : 'Drag & drop your audio file here'}
          </p>
          <p className="text-gray-400 text-sm">or</p>
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="btn-primary px-8 py-2.5"
        >
          Browse Files
        </button>

        {/* Format chips */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {FORMATS.map((f) => (
            <span key={f} className="px-3 py-1 bg-surface-elevated border border-surface-border
                                      rounded-full text-xs font-mono text-gray-400">
              {f}
            </span>
          ))}
          <span className="text-xs text-gray-500">· Max 100 MB</span>
        </div>
      </div>
    </div>
  );
}
