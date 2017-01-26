import BaseError from './base';

export default class ApiError extends BaseError {
  constructor(params) {
    super(params);
    this.name = 'ApiError';
  }
}
