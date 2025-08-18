// Temporary CORS Proxy Server
// This creates a simple proxy to bypass CORS issues for testing

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true
}));

// Create proxy
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000/api',
  changeOrigin: true,
  onProxyRes: function (proxyRes, req, res) {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
  },
  onError: function (err, req, res) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error occurred');
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to http://localhost:8000`);
  console.log(`🔧 Update your frontend API_BASE_URL to: http://localhost:${PORT}/api`);
});
