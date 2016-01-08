import http from 'http';
import Router from './router';

const router = new Router();

router.post('users/{id}', [], (req, res) => {
  console.log(req.body);
  res.end("ok");
});

router.match(["get", "post"], 'users', [], function(req, res) {
  res.end('ok any methods for /users/')
});

router.prefix('articles' , function() {
  this.get('/{id}', [], (req, res) => {
    res.end('article ' + req.params.id);
  });

  this.post('/{id}/comments', [], (req, res) => {

  });
});

router.crud('admin', ['delete'], [], {
  'index': (req, res) => {
    res.end('index');
  },
  'create': () => {},
  'read': () => {},
  'update': () => {}
});

/**
 * All others routes
 */
router.any('*', [], (req, res) => {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 not found');
})

// router.debug();

const server = http.createServer( router.check.bind(router) );

server.listen('8080', () => {
  console.log("Server listening on port 8080");
})
