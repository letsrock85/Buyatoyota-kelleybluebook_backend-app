import BaseError from './base';

export default class NotFoundError extends BaseError {
  constructor(params) {
    super(params);
    this.name = 'NotFoundError';
  }
}
