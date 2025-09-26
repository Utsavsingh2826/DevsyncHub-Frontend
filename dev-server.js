// Development server with proper CORS headers for WebContainer
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Set CORS headers for WebContainer compatibility
app.use((req, res, next) => {
  // Essential headers for WebContainer
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Additional headers for better compatibility
  res.header('Cross-Origin-Isolation', 'true');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Allow SharedArrayBuffer
  res.header('Permissions-Policy', 'cross-origin-isolated=()');
  
  next();
});

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add CORS headers to proxied requests
    proxyReq.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    proxyReq.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  }
}));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log('✅ CORS headers set for WebContainer compatibility');
  console.log('🔧 WebContainer should now work properly');
  console.log('📝 Make sure your backend is running on port 5000');
  console.log('🌐 Access your app at: http://localhost:' + PORT);
});
