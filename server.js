// Simple static file server that serves the built dist/ folder
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = path.join(DIST, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // SPA fallback: serve index.html for unknown routes
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST, 'index.html');
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');

    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);

    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': data.length,
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 윷놀이 전국일주 서버 실행 중: http://0.0.0.0:${PORT}`);
  console.log(`📌 빌드 폴더: ${DIST}`);
});

server.on('error', err => {
  console.error('Server error:', err.message);
  process.exit(1);
});
