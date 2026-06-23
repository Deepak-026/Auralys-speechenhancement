const path = require('path');
const fs = require('fs');
const { MAX_FILE_SIZE } = require('../config/env.config');

const ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.opus'];

function validateAudioFile(filePath, originalName) {
  const errors = [];

  if (!filePath || !fs.existsSync(filePath)) {
    errors.push('Uploaded file not found on server.');
  } else {
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      errors.push('Uploaded file is empty.');
    }
    if (stats.size > MAX_FILE_SIZE) {
      errors.push(`File size ${(stats.size / 1024 / 1024).toFixed(1)} MB exceeds the 100 MB limit.`);
    }
  }

  const ext = path.extname(originalName || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(
      `Unsupported format '${ext}'. Please upload a .wav, .mp3, or .opus file.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateAudioFile };
