const path = require('path');
const { v4: uuidv4 } = require('uuid');

function generateJobId() {
  return uuidv4();
}

function buildUploadedFileInfo(file) {
  return {
    jobId: generateJobId(),
    originalFilename: file.originalname,
    uploadedFilename: file.filename,
    uploadedPath: file.path,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    extension: path.extname(file.originalname).toLowerCase(),
    uploadedAt: new Date().toISOString(),
  };
}

module.exports = { buildUploadedFileInfo, generateJobId };
