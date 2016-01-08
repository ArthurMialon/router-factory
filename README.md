# simple-router
A simple express/laravel like router for your nodejs application

## Usage
### Require
```javascript
var Router = require('router-factory');
```

### Simple Example
```javascript
var Router = require('router-factory');
var http = require('http');

var router = new Router();

/* Simple route to get a user (all http methods are available) */
router.get('users/{id}', [/* middleware functions */], (req, res) => {
  console.log(req.params);
  res.end("ok");
});

/* A route with middleware */
let isLogged = (req, res, next) => {
  /* Do something with token or session */
  next();
};

router.get('admin/', [isLogged], (req, res) => {
  res.end("ok you can pass");
});

/* Index users */
router.get('users', [/* middleware functions */], (req, res) => {
  res.end("ok");
});

/* Create user */
router.get('users', [/* middleware functions */], (req, res) => {
  console.log(req.body);
  res.end("ok");
});

/* OR */
/* Match GET || POST for users path */
router.match(["get", "post"], 'users', [], function(req, res) {
  console.log(req.body);
});


/* Let's do some sub-route for users */
router.prefix('users' , function() {
  /* match GET users/{id}/message */
  this.get('/{id}/message', [], (req, res) => {
    res.end('user ' + req.params.id);
  });

  /* match POST users/{id}/message */
  this.post('/{id}/comments', [], (req, res) => {
    console.log(req.body);
    res.end('ok');
  });
});

/* You can create crud to user but except delete route */
router.crud('users', ['delete'], [], {
  'index': (req, res) => { res.end('index'); }, // users/
  'create': () => { /* do something */ }, // users/
  'read': () => { /* do something */ }, // users/{id}
  'update': () => { /* do something */ } // users/{id}
});

/* If no route match the do something else */
router.any('*', [], (req, res) => {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 not found');
});

/* Log all your route in console */
router.debug();

const server = http.createServer( router.check.bind(router) );

server.listen('8080', () => {
  console.log("Server listening on port 8080");
})
```


## TODO
- [ ] Unit testing apis
- [ ] Made middleware optional
