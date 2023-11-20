const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('node:fs');
const LimitSizeStream = require('./LimitSizeStream');

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

  const limitStream = new LimitSizeStream({limit: 1e6});

  switch (req.method) {
    case 'POST':
      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('Nested paths are not allowed');
        return;
      }

      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

      req
          .pipe(limitStream)
          .pipe(writeStream);

      limitStream.on('error', (error) => {
        if (error.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('File is too big');
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
        }

        fs.unlink(filepath, (err) => {});
      });

      writeStream.on('error', (error) => {
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File exists');
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
          fs.unlink(filepath, (error) => {});
        }
      });

      writeStream.on('finish', () => {
        res.statusCode = 201;
        res.end('file has been saved');
      });

      req.on('aborted', () => {
        fs.unlink(filepath, (error) => {});
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
