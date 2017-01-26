import logger from '../logger';

const STATUSES = {
  502: 'Server Error',
  404: 'Not Found',
  400: 'Bad request',
  403: 'Forbidden',
};

export default class BaseError extends Error {
  constructor(params = {}) {
    const status = (params.status && STATUSES[params.status]) ? params.status : 502;
    const message = params.message || STATUSES[status];
    super(message);
    this.name = 'BaseError';
    this.status = status;
    logger.log(message);
  }
}
