const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PYTHON_PATH: process.env.PYTHON_PATH || 'python',
  ENGINE_PATH: process.env.ENGINE_PATH
    ? path.resolve(process.env.ENGINE_PATH)
    : path.join(__dirname, '../../engine/main.py'),
  UPLOAD_DIR: process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(__dirname, '../../uploads'),
  OUTPUT_DIR: process.env.OUTPUT_DIR
    ? path.resolve(process.env.OUTPUT_DIR)
    : path.join(__dirname, '../../outputs'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 100 * 1024 * 1024,
  PYTHON_TIMEOUT_MS: parseInt(process.env.PYTHON_TIMEOUT_MS, 10) || 5 * 60 * 1000,
};
