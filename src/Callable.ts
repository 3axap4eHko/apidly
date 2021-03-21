export default class Callbable extends Function {
  constructor(func: Function) {
    super();
    return Object.setPrototypeOf(func, new.target.prototype);
  }
}
