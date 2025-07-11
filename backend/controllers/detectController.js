const fs = require('fs');
const path = require('path');
const os = require('os');
const { runYoloModel } = require('../utils/yoloUtils');

exports.detectVegetables = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    filePath = req.file.path;
    console.log('File received:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(500).json({ message: 'Uploaded file not found' });
    }

    try {
      const veggies = await runYoloModel(filePath);
      console.log('Detection results:', veggies);
      
      // Clean up file after successful detection
      try {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Temporary file cleaned up:', filePath);
        }
      } catch (cleanupError) {
        console.warn('Failed to delete temporary file:', cleanupError);
      }
      
      res.json({ detected: veggies });
    } catch (detectionError) {
      console.error('Detection error:', detectionError);
      
      // Clean up file after failed detection
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('Temporary file cleaned up after error:', filePath);
        } catch (cleanupError) {
          console.warn('Failed to delete temporary file:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        message: 'Detection failed', 
        error: detectionError.message,
        details: process.env.NODE_ENV === 'development' ? detectionError.stack : undefined
      });
    }
  } catch (err) {
    console.error('Controller error:', err);
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('Temporary file cleaned up after error:', filePath);
      } catch (cleanupError) {
        console.warn('Failed to delete temporary file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Detection failed', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
