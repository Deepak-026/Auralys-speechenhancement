import { useState, useCallback, useRef } from 'react';
import { uploadAndEnhance, getOutputUrl } from '../services/enhancement';
import { validateAudioFile } from '../utils/validators';

const DEFAULT_SETTINGS = {
  model: 'sepformer-wham16k',
  noiseReduction: 'auto',
  outputFormat: 'wav',
  preserveSampleRate: true,
  outputNormalization: true,
  speechPreservation: 75,
  denoisingAggressiveness: 70,
};

export function useEnhancement() {
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const selectFile = useCallback((selectedFile) => {
    const { valid, error: validationError } = validateAudioFile(selectedFile);
    if (!valid) {
      return { success: false, error: validationError };
    }

    // Revoke previous object URL
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setFilePreviewUrl(previewUrl);
    setStatus('idle');
    setResult(null);
    setError(null);
    setUploadProgress(0);
    return { success: true, error: null };
  }, [filePreviewUrl]);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const startEnhancement = useCallback(async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }

    setStatus('uploading');
    setUploadProgress(0);
    setError(null);
    setResult(null);

    try {
      const data = await uploadAndEnhance(file, settings, (pct) => {
        setUploadProgress(pct);
        if (pct >= 100) {
          setStatus('processing');
        }
      });

      setResult({
        ...data,
        originalUrl: filePreviewUrl,
        enhancedUrl: getOutputUrl(data.jobId),
        enhancedDownloadUrl: getOutputUrl(data.jobId, true),
      });
      setStatus('done');
    } catch (e) {
      setError(e.message || 'Enhancement failed. Please try again.');
      setStatus('error');
    }
  }, [file, settings, filePreviewUrl]);

  const reset = useCallback(() => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setFile(null);
    setFilePreviewUrl(null);
    setStatus('idle');
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setSettings(DEFAULT_SETTINGS);
  }, [filePreviewUrl]);

  return {
    file,
    filePreviewUrl,
    settings,
    status,
    uploadProgress,
    result,
    error,
    selectFile,
    updateSettings,
    startEnhancement,
    reset,
  };
}
