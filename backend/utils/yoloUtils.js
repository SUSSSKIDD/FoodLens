const ort = require('onnxruntime-web');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const labels = ["Beans", "Bitter_Gourd", "Bottle_Gourd", "Broccoli", "Cabbage"];

// Cache for the ONNX session
let session = null;

async function initializeYolo() {
  try {
    const modelPath = path.join(__dirname, '..', 'models', 'detection', 'best.onnx');
    console.log('Looking for model at:', modelPath);
    
    try {
      await fs.access(modelPath);
      console.log('Model file exists');
    } catch (accessError) {
      console.error('Model file not found:', accessError);
      throw new Error('Model file not found');
    }
    
    console.log('Creating ONNX session...');
    // Read the model file as ArrayBuffer
    const modelBuffer = await fs.readFile(modelPath);
    const modelArrayBuffer = modelBuffer.buffer.slice(
      modelBuffer.byteOffset,
      modelBuffer.byteOffset + modelBuffer.byteLength
    );

    session = await ort.InferenceSession.create(modelArrayBuffer, {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all'
    });
    console.log('✅ YOLO model loaded successfully');
    return session;
  } catch (error) {
    console.error('❌ Error loading YOLO model:', error);
    throw error;
  }
}

const preprocessImage = async (filePath) => {
  const { data, info } = await sharp(filePath)
    .resize(224, 224)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert [HWC] to [CHW]
  const chw = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    chw[i] = data[i * 3] / 255.0;         // R
    chw[i + 224 * 224] = data[i * 3 + 1] / 255.0; // G
    chw[i + 2 * 224 * 224] = data[i * 3 + 2] / 255.0; // B
  }

  return new ort.Tensor('float32', chw, [1, 3, 224, 224]);
};

const runYoloModel = async (imagePath) => {
  try {
    // Initialize model if not already done
    const modelSession = await initializeYolo();
    
    const tensor = await preprocessImage(imagePath);
    const feeds = { images: tensor };
    const results = await modelSession.run(feeds);
    const output = results[Object.keys(results)[0]].data;

    const numDetections = output.length / 6;
    const detections = [];

    for (let i = 0; i < numDetections; i++) {
      const base = i * 6;
      const x1 = output[base + 0];
      const y1 = output[base + 1];
      const x2 = output[base + 2];
      const y2 = output[base + 3];
      const confidence = output[base + 4];
      const classId = output[base + 5];

      if (confidence > 0.5) {
        const labelIndex = Math.round(classId);
        if (labelIndex >= 0 && labelIndex < labels.length) {
          detections.push({
            label: labels[labelIndex],
            confidence: +(confidence * 100).toFixed(2),
            box: {
              x1: +x1.toFixed(2),
              y1: +y1.toFixed(2),
              x2: +x2.toFixed(2),
              y2: +y2.toFixed(2)
            }
          });
        } else {
          console.warn(`Invalid class ID detected: ${classId}`);
        }
      }
    }

    if (detections.length === 0) {
      console.log('No vegetables detected with confidence > 0.5');
    }

    return detections;
  } catch (error) {
    console.error('❌ Error in runYoloModel:', error);
    throw error;
  }
};

// Cleanup function for graceful shutdown
const cleanup = async () => {
  if (session) {
    try {
      await session.release();
      session = null;
      console.log('✅ ONNX session released');
    } catch (error) {
      console.error('❌ Error releasing ONNX session:', error);
    }
  }
};

module.exports = { runYoloModel, cleanup };
