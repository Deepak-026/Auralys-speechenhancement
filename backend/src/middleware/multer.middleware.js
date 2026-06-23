const { upload } = require('../config/multer.config');

const uploadSingle = (fieldName = 'audio') => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'File too large. Maximum allowed size is 100 MB.',
          error_type: 'FileTooLarge',
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message,
        error_type: 'UploadError',
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided. Please upload a .wav, .mp3, or .opus file.',
        error_type: 'MissingFile',
      });
    }
    next();
  });
};

module.exports = { uploadSingle };
