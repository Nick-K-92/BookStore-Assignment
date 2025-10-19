const apiMock = require('@ng-apimock/core');
const devInterface = require('@ng-apimock/dev-interface');
const connect = require('connect');
const cors = require('cors');
const http = require('http');
const serveStatic = require('serve-static');
const fs = require('fs');
const path = require('path');

const BOOKS_PATH = path.join(__dirname, 'api-data/book/books_get_200_data.json');

let books = JSON.parse(fs.readFileSync(BOOKS_PATH, 'utf8'));

const start = (appPort, mockPort) => {
  const app = connect();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use('/book-store-bff/v1/books', (req, res, next) => {
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const onSaleParam = url.searchParams.get('onSale');

      let result = books;

      if (onSaleParam === 'true') {
        result = books.filter(b => String(b.onSale) === String(onSaleParam));
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => (body += chunk.toString()));
      req.on('end', () => {
        const newBook = JSON.parse(body);
        newBook.id = `temp-${Date.now()}`;
        books.push(newBook);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(newBook));
      });
    } else {
      next();
    }
  });

  app.use('/book-store-bff/v1/books/', (req, res, next) => {
    const match = req.url.match(/\/([^\/]+)$/);
    const bookId = match ? match[1] : null;

    if (!bookId) return next();

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => (body += chunk.toString()));
      req.on('end', () => {
        const updatedBook = JSON.parse(body);
        const index = books.findIndex(b => b.id === bookId);

        if (index === -1) {
          res.statusCode = 404;
          res.end(JSON.stringify({ message: 'Book not found' }));
          return;
        }

        books[index] = { ...books[index], ...updatedBook };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(books[index]));
      });
    } else if (req.method === 'DELETE') {
      const index = books.findIndex(b => b.id === bookId);
      if (index !== -1) {
        books.splice(index, 1);
        res.statusCode = 204;
        res.end();
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Book not found' }));
      }
    } else {
      next();
    }
  });

  app.use(apiMock.middleware);
  app.use('/mocking', serveStatic(devInterface));

  app.use(function (req, res, next) {
    if (req.url === '/') {
      res.writeHead(301, { Location: '/mocking' });
      res.end();
    } else {
      next();
    }
  });

  http
    .createServer(app)
    .listen(mockPort, function () {
      console.log('Mock server running on port ' + mockPort + '.');
    })
    .on('error', function (e) {
      console.log('Mock server is already started.');
    });

  apiMock.processor.process({
    src: 'mocks',
    patterns: {
      mocks: 'api/**/*.json',
      presets: 'api/**/*.preset.json',
    },
    watch: true,
  });
};

exports.start = start;
