const express = require('express');
const projectionService = require('../services/projectionService');
const { protect } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// @route   POST /api/projections/run
// @desc    Run adaptive learning projection simulation
// @access  Private (Admin only in production)
router.post('/run', protect, async (req, res) => {
  try {
    const {
      numStudents = 100,
      numSessions = 50,
      targetTopic = 'G11_16',
      targetMastery = 0.85
    } = req.body;

    // Note: In production, add admin check here
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const result = await projectionService.runProjection({
      numStudents,
      numSessions,
      targetTopic,
      targetMastery
    });

    res.json(result);
  } catch (error) {
    console.error('Run projection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running projection',
      error: error.message
    });
  }
});

// @route   GET /api/projections/report
// @desc    Get projection report
// @access  Private
router.get('/report', protect, async (req, res) => {
  try {
    const result = await projectionService.getProjectionReport();
    res.json(result);
  } catch (error) {
    console.error('Get projection report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projection report',
      error: error.message
    });
  }
});

// @route   GET /api/projections/visualizations
// @desc    Get available visualizations
// @access  Private
router.get('/visualizations', protect, async (req, res) => {
  try {
    const result = await projectionService.getVisualizations();
    res.json(result);
  } catch (error) {
    console.error('Get visualizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visualizations',
      error: error.message
    });
  }
});

// @route   GET /api/projections/visualization/:filename
// @desc    Serve visualization image
// @access  Private
router.get('/visualization/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: Only allow specific image files
    const allowedFiles = ['learning_curves.png', 'kpi_comparison.png', 'improvement_metrics.png'];
    if (!allowedFiles.includes(filename)) {
      return res.status(403).json({ success: false, message: 'Invalid file' });
    }

    const filePath = path.join(__dirname, '../../ml-services', filename);
    
    try {
      await fs.access(filePath);
      res.sendFile(path.resolve(filePath));
    } catch {
      res.status(404).json({ success: false, message: 'Visualization not found' });
    }
  } catch (error) {
    console.error('Serve visualization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving visualization',
      error: error.message
    });
  }
});

module.exports = router;

