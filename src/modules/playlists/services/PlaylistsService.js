const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModel } = require('../../../utils');
const NotFoundError = require('../../../exceptions/NotFoundError');
const InvariantError = require('../../../exceptions/InvariantError');

const logger = require('../../../utils/logger');

const ctx = 'Songs-Services-PlaylistsService';

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  // async addSong({
  //   title,
  //   year,
  //   performer,
  //   genre,
  //   duration,
  // }) {
  //   const id = `song-${nanoid(16)}`;
  //   const insertedAt = new Date().toISOString();

  //   const query = {
  //     text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
  //     values: [id, title, year, performer, genre, duration, insertedAt],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rows[0].id) {
  //     logger.warn(ctx, 'Failed to add song', 'addSong');
  //     throw new InvariantError('Failed to add song');
  //   }

  //   return result.rows[0].id;
  // }

  async addSong(payload) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
      values: [id, ...Object.values(payload), insertedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      logger.warn(ctx, 'Failed to add song', 'addSong');
      throw new InvariantError('Failed to add song');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      logger.warn(ctx, 'Failed to get song, invalid Id', 'getSongById');
      throw new NotFoundError('Song not found');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, {
    title,
    year,
    performer,
    genre,
    duration,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      logger.warn(ctx, 'Failed to update song, id not found', 'editSongById');
      throw new NotFoundError('Failed to update song, id not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      logger.warn(ctx, 'Failed to delete song, id not found', 'deleteSongById');
      throw new NotFoundError('Failed to delete song, id not found');
    }
  }
}

module.exports = PlaylistsService;
