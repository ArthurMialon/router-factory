/**
 * Parameter class
 */
export default class Parameter {
  constructor(name) {
    this.name   = name.substring(1, name.length -1);
    this.regExp = '([1-9A-z_]+)';
  }
}
