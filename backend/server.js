const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');
const { cleanup: cleanupYolo } = require('./utils/yoloUtils');
const PORT = process.env.PORT || 8080;

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected');

  // Start Express Server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API available at https://backend-8123.uc.r.appspot.com`);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down...');
    
    try {
      // Cleanup ONNX session
      await cleanupYolo();
      console.log('✅ ONNX cleanup completed');
      
      // Close MongoDB connection
      await mongoose.connection.close(false);
      console.log('📴 MongoDB connection closed');
      
      // Close server
      server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle different termination signals
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});
