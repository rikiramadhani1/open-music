const ClientError = require('./ClientError');

class NotFounderror extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFounderror;
