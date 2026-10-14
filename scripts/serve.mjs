import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 8767);
const clients = new Set();
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css',
  '.js': 'application/javascript', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.m3u8': 'application/vnd.apple.mpegurl', '.ts': 'video/mp2t',
  '.vtt': 'text/vtt', '.pdf': 'application/pdf', '.json': 'application/json',
};
const reloadScript = `<script>new EventSource('/__preview_events').onmessage = () => location.reload();</script>`;
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  if (pathname === '/__preview_events' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    res.write(': local preview connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  if (!(pathname.startsWith('/assets/') || ['/index.html', '/styles.css', '/app.js'].includes(pathname))
      || pathname.split('/').some(part => part.startsWith('.'))) {
    res.writeHead(404).end('Not found'); return;
  }
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  let stat;
  try { stat = fs.statSync(file); }
  catch { res.writeHead(404).end('Not found'); return; }
  if (!stat.isFile()) { res.writeHead(404).end('Not found'); return; }
  const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' };
  if (pathname === '/index.html') {
    const html = fs.readFileSync(file, 'utf8').replace('</body>', reloadScript + '</body>');
    res.writeHead(200, { ...headers, 'Content-Length': Buffer.byteLength(html) });
    res.end(req.method === 'HEAD' ? undefined : html);
    return;
  }
  let start = 0, end = stat.size - 1, status = 200;
  headers['Accept-Ranges'] = 'bytes';
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return;
    }
    if (!range[1]) start = Math.max(0, stat.size - Number(range[2]));
    else {
      start = Number(range[1]);
      if (range[2]) end = Math.min(Number(range[2]), end);
    }
    if (start > end || start >= stat.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length'] = end - start + 1;
  res.writeHead(status, headers);
  if (req.method === 'HEAD') { res.end(); return; }
  const stream = fs.createReadStream(file, { start, end });
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
});

let pending;
const watchedFiles = new Set(['index.html', 'styles.css', 'app.js']);
const watcher = fs.watch(root, (_event, file) => {
  if (!watchedFiles.has(file)) return;
  clearTimeout(pending);
  pending = setTimeout(() => {
    for (const client of clients) client.write('data: reload\n\n');
  }, 150);
});
function stop() {
  clearTimeout(pending);
  watcher.close();
  clients.forEach(client => client.end());
  server.close();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
server.on('error', error => { console.error(error.message); stop(); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  console.log(`Local preview: http://127.0.0.1:${port}/`);
  console.log('Save index.html, styles.css, or app.js to refresh the page automatically.');
  console.log('This server is accessible only from this computer. Press Ctrl+C to stop.');
});
