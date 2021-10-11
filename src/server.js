const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { port, host, serviceName } = require('./configs/global_config');
const logger = require('./utils/logger');
const ClientError = require('./exceptions/ClientError');

// songs
const song = require('./modules/songs/api');
const SongService = require('./modules/songs/services/SongsService');
const SongValidator = require('./modules/songs/validator');

// users
const users = require('./modules/users/api');
const UsersService = require('./modules/users/services/UsersService');
const UsersValidator = require('./modules/users/validator');

// authentications
const authentications = require('./modules/authentications/api');
const AuthenticationsService = require('./modules/authentications/services/AuthenticationsService');
const TokenManager = require('./utils/tokenize/TokenManager');
const AuthenticationsValidator = require('./modules/authentications/validator');

// playlists
const playlists = require('./modules/playlists/api');
const PlaylistsService = require('./modules/playlists/services/PlaylistsService');
const PlaylistsValidator = require('./modules/playlists/validator');

// collaborations
const collaborations = require('./modules/collaborations/api');
const CollaborationsService = require('./modules/collaborations/services/CollaborationsService');
const CollaborationsValidator = require('./modules/collaborations/validator');

const ctx = 'server';

const init = async () => {
  const songService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);

  const server = Hapi.server({
    port,
    host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: song,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      logger.warn('Api-Handler', 'Bad Request from handler', 'Handler', response.name);
      return newResponse;
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  });

  await server.start();
  logger.info(ctx, `${serviceName} started, listening at ${server.info.uri}`, 'server.start');
};

init();
