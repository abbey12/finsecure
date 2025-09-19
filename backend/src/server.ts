import app from './app';

// The app is already configured and started in app.ts
// This file exists for potential future server-specific configurations

// Start the server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Finsecure Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💰 Currency: ${process.env.DEFAULT_CURRENCY || 'GHS'}`);
  console.log(`🇬🇭 Country: ${process.env.DEFAULT_COUNTRY || 'GH'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
