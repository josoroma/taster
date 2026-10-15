import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const types = { '.html':'text/html; charset=utf-8', '.mjs':'text/javascript', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.json':'application/json', '.ttf':'font/ttf' };
const port = Number(process.env.PORT || 5173);
createServer(async (req, res) => {
  try {
    const requested = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(requested.pathname);
    if (pathname === '/taster') { res.writeHead(302, { Location: '/taster/' }); res.end(); return; }
    const prefix = pathname.startsWith('/taster/') ? '/taster' : '';
    if (prefix) pathname = pathname.slice(7);
    // Keep earlier preview links working after the example sources moved.
    for (const name of ['bell-lab','workshop','lumen']) {
      if (pathname === `/${name}` || pathname.startsWith(`/${name}/`)) {
        const suffix = pathname.slice(name.length + 1) || '/';
        res.writeHead(302, { Location: `${prefix}/examples/${name}${suffix}${requested.search}` });res.end();return;
      }
    }
    const path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    const info = await stat(path);
    if (info.isDirectory() && !pathname.endsWith('/')) {
      res.writeHead(302, { Location: `${requested.pathname}/${requested.search}` });res.end();return;
    }
    const file = info.isDirectory() ? resolve(path, 'index.html') : path;
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Taster is ready at http://localhost:${port}/taster/`));
