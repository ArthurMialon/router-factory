import Route from './route';
import Cycle from './cycle';
import jsonBody from 'body/json';

/**
 * Router Class
 */
export default class Router {
  constructor() {
    this.__methods = ['get', 'post', 'put', 'delete', 'patch', 'options'];
    this.__prefixer = '';
    this.routes  = this.__methods.reduce( (final, method) => {
      final[method] = [];
      return final;
    }, {});
  }


  /**
   * @description
   * Create a GET route
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  get(path, middleware, handler) {
    this.add('get', path, middleware, handler);
  }

  /**
   * @description
   * Create a POST route
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  post(path, middleware, handler) {
    this.add('post', path, middleware, handler);
  }

  /**
   * @description
   * Create a PUT route
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  put(path, middleware, handler) {
    this.add('put', path, middleware, handler);
  }

  /**
   * @description
   * Create a DELETE route
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  delete(path, middleware, handler) {
    this.add('delete', path, middleware, handler);
  }

  /**
   * @description
   * Create a PATCH route
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  patch(path, middleware, handler) {
    this.add('patch', path, middleware, handler);
  }

  /**
   * @description
   * Create a HEAD route
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  head(path, middleware, handler) {
    this.add('head', path, middleware, handler);
  }

  /**
   * @description
   * Create a OPTIONS route
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  options(path, middleware, handler) {
    this.add('options', path, middleware, handler);
  }

  /**
   * @description
   * Match all methods with a specific path
   * @param {array} methods
   * @param {string} path
   * @param {array} middleware
   * @param {function} handler
   */
  match(methods, path, middleware, handler) {
    methods
      .filter( method => this.__methods.indexOf(method.toLowerCase() != -1))
      .forEach( method => { this.add(method, path, middleware, handler); })
  }

  /**
   * @description
   * Prefix multiple routes
   * @param {string} prefix
   * @param {function} function
   */
  prefix(prefix, cb) {
    this.__prefixer = prefix;
    cb.call(this);
    this.__prefixer = '';
  }

  /**
   * @description
   * Match any methods for a route
   * @param {string} path
   * @param {array} middleware
   * @param {function} handler
   */
  any(path, middleware, handler) {
    this.__methods.forEach( method => {
      this.add(method, path, middleware, handler);
    });
  }

  /**
   * @description
   * Add a route to the router
   * @param {string} method
   * @param {string} path
   * @param {array} middleware
   * @param {function} final handler
   */
  add(method, path, middleware, handler) {
    if (typeof path != 'string' ) {
      throw 'Warning ! Path should be a String';
    }

    if (typeof handler != 'function') {
      throw 'Warning ! Final handler should be a function but got :: ' + typeof handler;
    }

    this.routes[method].push({
      route: new Route(this.__prefixer + path),
      middleware,
      handler
    });
  }

  /**
   * @description
   * Create CRUD route for a giving resource
   * @param {string} resource
   * @param {array} excepted crud method
   * @param {array} middleware
   * @param {function} handler
   */
  crud(resource, except, middleware, handlers){
    this.__crud
      .filter( route => except.indexOf(route.name) == -1 )
      .forEach( route => {
        this.add(route.method, route.path.replace('$r', resource), middleware, handlers[route.name]);
      });
  }


  /**
   * @description
   * Launch the Router on each request
   * @param {Object} request
   * @param {Object} response
   */
  check(request, response) {
    const handling = (err, body) => {
      /* Set body data in request object */
      request.body = body;

      /* Checking saved routes  or otherwise routes with '*' path */
      let route = this.__getRoute(request) || this.__getOtherwiseRoute(request.method, request.url) || null;

      /* Route find - get parameters */
      if (route != null) {
        request.params = (route.route.url.base != '*') ? route.route.parseParams(request.url) : {};
      }

      /* Return handling or error request */
      return (route) ? this.__handler(route, request, response) : this.__notFound(response, request.method, request.url);
    };

    /* Parsing body and handling request */
    jsonBody(request, response, handling);
  }

  /**
   * @description
   * Debug all routes declaration
   */
  debug() {
    this.__methods.forEach( method => {
      console.log("------------");
      this.routes[method].forEach(route => {
        console.log(method.toUpperCase(), '::', route.route.url.base, '::', route.route.url.regExp);
      })
      console.log("------------ \n");
    });
  }

  /**
   * @private
   * @description
   * Return an error with 404 status when not found
   * @param {Object} response
   * @param {string} method
   * @param {string} path url
   */
  __notFound(response, method, path) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('cannot ' + method + ' ' + path);
  }

  /**
   * @private
   * @description
   * Get otherwise route if no others match
   * @param {string} method
   * @param {string} url
   * @return {Object} route
   */
  __getOtherwiseRoute(method, url) {
    return this.routes[method.toLowerCase()].filter( route => {
      return route.route.url.base == "*";
    })[0];
  }

  /**
   * @private
   * @description
   * Get a route signature that match with the requesting url
   * @param {Object} request
   * @return {Object} route signature
   */
  __getRoute(request) {
    return this.routes[request.method.toLowerCase()].filter( signature => {
      if (signature.route.match(request.url)) {
        return signature;
      }
    })[0];
  }

  /**
   * @private
   * @description
   * To Handler middleware and functions
   * @param {Object} route
   * @param {Object} request
   * @param {Object} response
   */
  __handler(route, request, response) {
    let handlers = Cycle([].concat(route.middleware, [route.handler]));

    const next = () => {
      handlers.next().value(request, response, next);
    }

    return handlers.value(request, response, next);
  }

  /**
   * @private
   * @description
   * Crud configuration
   * @return {array} crud configuration
   */
  get __crud() {
    return [
      {name: 'index',  method : 'get',   path   : '$r'},
      {name: 'create', method: 'post',   path  : '$r'},
      {name: 'read',   method  : 'get',  path   : '$r/{id}'},
      {name: 'update', method: 'put',    path   : '$r/{id}'},
      {name: 'delete', method: 'delete', path: '$r/{id}'},
    ];
  }

}
