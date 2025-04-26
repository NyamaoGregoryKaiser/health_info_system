const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api',
      },
      onProxyRes: function(proxyRes, req, res) {
        // Preserve CORS and credentials headers
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3001';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
    })
  );
}; 