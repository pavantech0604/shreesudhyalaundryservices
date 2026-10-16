import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';

const root = path.resolve('out');
const port = Number(argv[2] || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Pass a valid port number');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
await stat(path.join(root, 'index.html'));
const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    let status = 200;
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await stat(file);
    } catch { file = path.join(root, '404.html'); status = 404; }
    const body = await readFile(file);
    response.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const status = error instanceof URIError ? 400 : 500;
    if (status === 500) console.error('Static preview request failed', error);
    response.writeHead(status);
    response.end(status === 400 ? 'Bad request' : 'Preview could not read this file');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Static preview: http://localhost:${port}`));
