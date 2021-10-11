const { Pool } = require('pg');
const InvariantError = require('../../../exceptions/InvariantError');
const logger = require('../../../utils/logger');

const ctx = 'Authentications-Services-AuthenticationsService';

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES ($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token from authentications where token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      logger.warn(ctx, 'Refresh Token is invalid', 'verifyRefreshToken');
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);

    const query = {
      text: 'DELETE FROM authentications where token = $1',
      values: [token],
    };

    await this._pool.query(query);
  }
}

module.exports = AuthenticationsService;
