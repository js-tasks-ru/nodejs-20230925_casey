const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('node:fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);
  switch (req.method) {
    case 'GET':
    // мы (сервер) получаем filename (например img.png), по которому нужно вернуть в ответ файл
      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('Nested paths are not allowed');
        return;
      }

      const fileStream = fs.createReadStream(filepath);

      fileStream.pipe(res);

      fileStream.on('error', (err) => {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        console.error(err);
        res.statusCode = 500;
        res.end('Internal error');
      });

      req.on('aborted', () => {
        fileStream.destroy();
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
