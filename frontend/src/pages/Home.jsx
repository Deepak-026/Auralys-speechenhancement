import React, { useRef, useEffect } from 'react';
import Hero from '../components/Hero';
import AudioUploader from '../components/AudioUploader';
import FilePreview from '../components/FilePreview';
import SettingsPanel from '../components/SettingsPanel';
import ProgressIndicator from '../components/ProgressIndicator';
import ResultsSection from '../components/ResultsSection';
import ErrorAlert from '../components/ErrorAlert';
import { useEnhancement } from '../hooks/useEnhancement';
import { useApp } from '../context/AppContext';

export default function Home({ resetSignal, historyEntry }) {
  const {
    file, filePreviewUrl, settings, status, uploadProgress,
    result, error,
    selectFile, updateSettings, startEnhancement, reset,
  } = useEnhancement();

  const { addNotification, refreshHistory } = useApp();
  const uploaderRef = useRef(null);

  // Reset when parent signals new enhancement
  useEffect(() => {
    if (resetSignal > 0) reset();
  }, [resetSignal]);

  // Load history entry
  useEffect(() => {
    if (!historyEntry) return;
    // If entry has a result we can show a summary notification
    if (historyEntry.status === 'success') {
      addNotification({
        type: 'info',
        title: 'History Entry',
        message: `Loaded: ${historyEntry.originalFilename}`,
      });
    }
  }, [historyEntry]);

  const handleFileSelect = (f) => {
    const { success, error: err } = selectFile(f);
    if (!success) {
      addNotification({ type: 'error', title: 'Invalid File', message: err });
    }
  };

  const handleEnhance = async () => {
    await startEnhancement();
    await refreshHistory();
    if (status !== 'error') {
      addNotification({
        type: 'success',
        title: 'Enhancement Complete',
        message: 'Your audio has been enhanced successfully.',
      });
    }
  };

  const handleReset = () => {
    reset();
  };

  const isIdle = status === 'idle' && !file;
  const hasFile = !!file && (status === 'idle' || status === 'error');
  const isProcessing = status === 'uploading' || status === 'processing';
  const isDone = status === 'done';

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Hero — only when no file and idle */}
      {isIdle && (
        <Hero onUploadClick={() => uploaderRef.current?.click()} />
      )}

      {/* Uploader — idle with no file */}
      {isIdle && (
        <div ref={uploaderRef} className="px-4 sm:px-8">
          <AudioUploader onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* File selected — show preview + settings */}
      {hasFile && (
        <div className="px-4 sm:px-8 space-y-4">
          {error && (
            <ErrorAlert
              message={error}
              onDismiss={() => {}}
              className="max-w-2xl mx-auto"
            />
          )}
          <FilePreview
            file={file}
            previewUrl={filePreviewUrl}
            onRemove={handleReset}
          />
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onEnhance={handleEnhance}
            disabled={!file || isProcessing}
          />
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="px-4 sm:px-8 flex justify-center">
          <ProgressIndicator
            uploadProgress={uploadProgress}
            status={status}
            onCancel={handleReset}
          />
        </div>
      )}

      {/* Results */}
      {isDone && result && (
        <div className="px-4 sm:px-8">
          <ResultsSection result={result} onReset={handleReset} />
        </div>
      )}
    </div>
  );
}
