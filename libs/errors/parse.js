import BaseError from './base';

export default class ParseError extends BaseError {
  constructor(params) {
    super(params);
    this.name = 'ParseError';
  }
}
