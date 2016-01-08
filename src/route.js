import Parameter from './parameter';

/**
 * Route Class
 */
export default class route {
  constructor(url) {
    /* Private */
    this.__paramsRegExp = new RegExp('(\{[1-9A-z_]+\})', 'g');

    this.url = {
      base: this.__stripTrailingSlash(url),
      regExp: url
    };

    this.params = this.__parse();

    this.url.regExp = this.__setUrlReqExp();
  }

  /**
   * @description
   * Parsing query data in the url
   * @param {string} url
   * @return {Object} query parameters
   */
  parseQuery(url) {
    let data = url
      .match(new RegExp('([^?=&]+)(=([^&]*))?', 'g'))
      .filter( param => param.charAt(0) != "/")
      .reduce( (final, param) => {
        let query = param.split('=');
        final[query[0]] = final[query[0]] || query[1];
        return final;
      }, {});

    return data;
  }

  /**
   * @description
   * Matching the request url
   * @param {string} url
   * @return {Object} parameters
   */
  match(url) {
    return Boolean(this.__clean(url).match(this.url.regExp));
  }

  /**
   * @description
   * Export all parameters from the requesting url
   * @param {string} url
   * @return {Object} parameters
   */
  parseParams(url) {
    let matching  = this.__clean(url).match(this.url.regExp);
    let nb_params = this.params.length;

    return this.params.reduce( (final, param, index) => {
      final[param.name] = matching[index + 1];
      return final;
    }, {});
  }

  /**
   * @private
   * @description
   * Get the query string from the url
   * @param {string} url
   * @return {Object} query object
   */
  __getQuery(url) {
    return url.match(new RegExp('[\?]'));
  }

  /**
   * @private
   * @description
   * Remove slashes at the end of the url
   * @param {string} url
   */
  __stripTrailingSlash(str) {
    if(str.substr(-1) === '/') {
      return str.substr(0, str.length - 1);
    }
    return str;
  }

  /**
   * @private
   * @description
   * Clean the url withour query string
   * @param {string} url
   * @return {string} clean url
   */
  __clean(url) {
    let query = this.__getQuery(url);

    /* Remove the query string from the requesting url */
    if (query) {
      url = url.substring(0, query.index);
    }

    return this.__stripTrailingSlash(url);
  }

  /**
   * @private
   * @description
   * Set the regular expression for the route url
   * @return {RegExp}
   */
  __setUrlReqExp() {
    this.url.regExp = this.params.reduce( (url, param) => {
      return url.replace(`{${param.name}}`, param.regExp);
    }, this.url.regExp);

    return (this.url.regExp == "*") ? new RegExp('([^ ]+)' + '$') : new RegExp(this.url.regExp + '$');
  }

  /**
   * @private
   * @description
   * Parsing url and set url parameters
   * @return {array} Array of Parameter Class
   */
  __parse() {
    let paramsRegExp = this.__paramsRegExp;
    let matching     = this.url.base.match(paramsRegExp) == null ? [] : this.url.base.match(paramsRegExp);
    return matching.map( param => new Parameter(param) );
  }
}
