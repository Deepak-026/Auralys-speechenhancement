import api, { API_BASE_URL } from './api';

export async function uploadAndEnhance(file, settings, onUploadProgress) {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('model', settings.model || 'sepformer-wham16k');
  formData.append('noiseReduction', settings.noiseReduction || 'auto');
  formData.append('outputFormat', settings.outputFormat || 'wav');

  const response = await api.post('/enhancement/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 15 * 60 * 1000,
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onUploadProgress(percent);
      }
    },
  });

  return response.data;
}

export function getOutputUrl(jobId, download = false) {
  return `${API_BASE_URL}/enhancement/output/${jobId}${download ? '?download=true' : ''}`;
}

export async function getJobStatus(jobId) {
  const response = await api.get(`/enhancement/status/${jobId}`);
  return response.data;
}

export async function fetchModels() {
  const response = await api.get('/enhancement/models');
  return response.data.models;
}
