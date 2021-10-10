const ClientError = require('../../../exceptions/ClientError');
const logger = require('../../../utils/logger');

const ctx = 'Playlists-Api-Handler';

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.putPlaylistByIdHandler = this.putPlaylistByIdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler({ payload }, h) {
    try {
      this._validator.validatePlaylistPayload(payload);

      const playlistId = await this._service.addPlaylist(payload);

      const response = h.response({
        status: 'success',
        message: 'Song added successfully',
        data: {
          playlistId,
        },
      });
      response.code(201);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        logger.warn(ctx, 'Bad Request', 'postPlaylistHandler', error.name);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Sorry, there was a failure on server.',
      });
      response.code(500);
      logger.error(ctx, 'Internal Error', 'postPlaylistHandler', error.name);
      return response;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const playlists = await this._service.getPlaylists();
      return {
        status: 'success',
        data: {
          playlists,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        logger.warn(ctx, 'Bad Request', 'getPlaylistsHandler', error.name);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Sorry, there was a failure on server.',
      });
      response.code(500);
      logger.error(ctx, 'Internal Error', 'getPlaylistsHandler', error.name);
      return response;
    }
  }

  async getPlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const playlist = await this._service.getPlaylistById(id);
      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        logger.warn(ctx, 'Bad Request', 'getPlaylistByIdHandler', error.name);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Sorry, there was a failure on server.',
      });
      response.code(500);
      logger.error(ctx, 'Internal Error', 'getPlaylistByIdHandler', error.name);
      return response;
    }
  }

  async putPlaylistByIdHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const {
        title, year, performer, genre, duration,
      } = request.payload;
      const { id } = request.params;

      await this._service.editPlaylistById(id, {
        title, year, performer, genre, duration,
      });

      return {
        status: 'success',
        message: 'Song updated successfully',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        logger.warn(ctx, 'Bad Request', 'putPlaylistByIdHandler', error.name);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Sorry, there was a failure on server.',
      });
      response.code(500);
      logger.error(ctx, 'Internal Error', 'putPlaylistByIdHandler', error.name);
      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deletePlaylistById(id);
      return {
        status: 'success',
        message: 'Playlist deleted successfully',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        logger.warn(ctx, 'Bad Request', 'deletePlaylistByIdHandler', error.name);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Sorry, there was a failure on server.',
      });
      response.code(500);
      logger.error(ctx, 'Internal Error', 'deletePlaylistByIdHandler', error.name);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;
