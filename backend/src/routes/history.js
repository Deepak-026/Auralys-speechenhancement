const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const historyService = require('../services/history');
const { OUTPUT_DIR, UPLOAD_DIR } = require('../config/env.config');

// GET /api/history — last 6 entries
router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 6, 6);
  const entries = historyService.getRecentEntries(limit);
  res.json({ success: true, history: entries, total: entries.length });
});

// GET /api/history/:id
router.get('/:id', (req, res) => {
  const entry = historyService.getEntry(req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'History entry not found.' });
  }
  res.json({ success: true, entry });
});

// DELETE /api/history/:id — remove entry and its output file
router.delete('/:id', (req, res) => {
  const entry = historyService.getEntry(req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'History entry not found.' });
  }

  // Delete output file if it exists
  if (entry.outputFile) {
    const filePath = path.join(OUTPUT_DIR, entry.outputFile);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.warn(`[History] Could not delete output file: ${filePath}`);
    }
  }

  historyService.deleteEntry(req.params.id);
  res.json({ success: true, message: 'History entry deleted.' });
});

module.exports = router;
