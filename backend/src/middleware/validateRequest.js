const VALID_MODELS = ['sepformer-wham16k'];
const VALID_NOISE_LEVELS = ['auto', 'low', 'medium', 'high'];
const VALID_OUTPUT_FORMATS = ['wav'];

function validateEnhancementRequest(req, res, next) {
  const { model, noiseReduction, outputFormat } = req.body;

  if (model && !VALID_MODELS.includes(model)) {
    return res.status(400).json({
      success: false,
      error: `Invalid model '${model}'. Valid options: ${VALID_MODELS.join(', ')}`,
      error_type: 'ValidationError',
    });
  }

  if (noiseReduction && !VALID_NOISE_LEVELS.includes(noiseReduction)) {
    return res.status(400).json({
      success: false,
      error: `Invalid noise reduction level '${noiseReduction}'. Valid: ${VALID_NOISE_LEVELS.join(', ')}`,
      error_type: 'ValidationError',
    });
  }

  if (outputFormat && !VALID_OUTPUT_FORMATS.includes(outputFormat)) {
    return res.status(400).json({
      success: false,
      error: `Invalid output format '${outputFormat}'. Valid: ${VALID_OUTPUT_FORMATS.join(', ')}`,
      error_type: 'ValidationError',
    });
  }

  next();
}

module.exports = { validateEnhancementRequest };
