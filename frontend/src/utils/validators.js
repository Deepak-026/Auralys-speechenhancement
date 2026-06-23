import { SUPPORTED_FORMATS, MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from './constants';

export function validateAudioFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const name = file.name || '';
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();

  if (!SUPPORTED_FORMATS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported format "${ext}". Please upload a ${SUPPORTED_FORMATS.join(', ')} file.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_LABEL}.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty. Please select a valid audio file.' };
  }

  return { valid: true, error: null };
}
