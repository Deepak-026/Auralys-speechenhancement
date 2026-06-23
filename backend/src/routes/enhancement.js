const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { uploadSingle } = require('../middleware/multer.middleware');
const { validateEnhancementRequest } = require('../middleware/validateRequest');
const { validateAudioFile } = require('../utils/fileValidator');
const { buildUploadedFileInfo } = require('../services/upload');
const { runPythonEngine } = require('../services/pythonRunner');
const historyService = require('../services/history');
const { OUTPUT_DIR } = require('../config/env.config');

// POST /api/enhancement/upload
router.post(
  '/upload',
  uploadSingle('audio'),
  validateEnhancementRequest,
  async (req, res, next) => {
    const fileInfo = buildUploadedFileInfo(req.file);
    const { jobId, uploadedPath, originalFilename } = fileInfo;

    // Re-validate on server
    const { valid, errors } = validateAudioFile(uploadedPath, originalFilename);
    if (!valid) {
      try { fs.unlinkSync(uploadedPath); } catch (_) {}
      return res.status(400).json({
        success: false,
        error: errors.join(' '),
        error_type: 'ValidationError',
      });
    }

    const model = req.body.model || 'sepformer-wham16k';
    const noiseReduction = req.body.noiseReduction || 'auto';
    const outputFormat = req.body.outputFormat || 'wav';

    // Create history entry (status: processing)
    const historyEntry = historyService.addEntry({
      id: jobId,
      filename: `enhanced_${jobId}.${outputFormat}`,
      originalFilename,
      status: 'processing',
      createdAt: new Date().toISOString(),
      completedAt: null,
      model,
      noiseReduction,
      outputFormat,
      inputMetadata: null,
      outputMetadata: null,
      outputFile: null,
      error: null,
    });

    try {
      const pythonArgs = [
        '--input', uploadedPath,
        '--output-dir', OUTPUT_DIR,
        '--model', model,
        '--job-id', jobId,
        '--noise-reduction', noiseReduction,
        '--output-format', outputFormat,
      ];

      const result = await runPythonEngine(pythonArgs);

      // Update history with success
      historyService.updateEntry(jobId, {
        status: 'success',
        completedAt: new Date().toISOString(),
        inputMetadata: result.input_metadata,
        outputMetadata: result.output_metadata,
        outputFile: path.basename(result.output_path),
        processingTimeSeconds: result.processing_time_seconds,
        snrImprovementDb: result.snr_improvement_db,
      });

      // Clean up uploaded input file
      try { fs.unlinkSync(uploadedPath); } catch (_) {}

      return res.json({
        success: true,
        jobId,
        outputFile: path.basename(result.output_path),
        downloadUrl: `/api/enhancement/output/${jobId}`,
        inputMetadata: result.input_metadata,
        outputMetadata: result.output_metadata,
        processingTimeSeconds: result.processing_time_seconds,
        modelUsed: result.model_used,
        modelKey: result.model_key,
        noiseReduction: result.noise_reduction,
        snrImprovementDb: result.snr_improvement_db,
      });

    } catch (err) {
      // Update history with error
      historyService.updateEntry(jobId, {
        status: 'error',
        completedAt: new Date().toISOString(),
        error: err.message,
      });

      // Clean up uploaded input file
      try { fs.unlinkSync(uploadedPath); } catch (_) {}

      const status = err.errorType === 'ValidationError' ? 400 : 500;
      return res.status(status).json({
        success: false,
        jobId,
        error: err.message,
        error_type: err.errorType || 'ProcessingError',
      });
    }
  }
);

// GET /api/enhancement/output/:jobId — stream/download enhanced file
router.get('/output/:jobId', (req, res, next) => {
  const { jobId } = req.params;
  const entry = historyService.getEntry(jobId);

  if (!entry || !entry.outputFile) {
    return res.status(404).json({
      success: false,
      error: 'Output file not found for this job.',
    });
  }

  const filePath = path.join(OUTPUT_DIR, entry.outputFile);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'Output file has been deleted or does not exist.',
    });
  }

  const download = req.query.download === 'true';
  if (download) {
    res.setHeader('Content-Disposition', `attachment; filename="${entry.outputFile}"`);
  }
  res.setHeader('Content-Type', 'audio/wav');
  res.sendFile(filePath);
});

// GET /api/enhancement/status/:jobId
router.get('/status/:jobId', (req, res) => {
  const entry = historyService.getEntry(req.params.jobId);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Job not found.' });
  }
  res.json({ success: true, job: entry });
});

// GET /api/enhancement/models — list available models
router.get('/models', (req, res) => {
  res.json({
    success: true,
    models: [
      {
        id: 'sepformer-wham16k',
        name: 'SepFormer WHAM 16kHz',
        description: 'SpeechBrain SepFormer trained on WHAM! dataset — excellent for real-world noise reduction',
        inputSampleRate: 16000,
        inputChannels: 1,
      },
    ],
  });
});

module.exports = router;
