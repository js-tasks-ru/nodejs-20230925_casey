const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('node:fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      // Вложенные папки не поддерживаются
      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('Nested paths are not allowed');
        return;
      }
      // Если файла на диске нет – сервер должен вернуть ошибку 404
      if (!filepath) {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }
      // Для удаления файла используем функцию unlink модуля fs
      fs.unlink(filepath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }

          console.error(err);
          res.statusCode = 500;
          res.end('Internal error');
        } else {
          res.statusCode = 200;
          res.end('Ok');
        }
      });

      break;

    default:
      res.statusCode = 500;
      res.end('Not implemented');
  }
});

module.exports = server;
