export const SUPPORTED_FORMATS = ['.wav', '.mp3', '.opus'];
export const SUPPORTED_FORMATS_DISPLAY = ['WAV', 'MP3', 'OPUS'];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const MAX_FILE_SIZE_LABEL = '100 MB';

export const MODELS = [
  {
    id: 'sepformer-wham16k',
    name: 'SepFormer WHAM 16kHz',
    description: 'Excellent for real-world noise — trained on WHAM! dataset using the SepFormer architecture.',
  },
];

export const NOISE_LEVELS = [
  { id: 'auto', label: 'Auto' },
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

export const OUTPUT_FORMATS = [
  { id: 'wav', label: 'WAV (Lossless)' },
];

export const API_BASE = '/api';
export const GITHUB_URL = 'https://github.com';

export const PROCESSING_STAGES = [
  'Uploading Audio',
  'Preparing Model',
  'Enhancing Speech',
  'Post-processing Audio',
  'Generating Output',
];
