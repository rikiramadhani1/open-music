const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { port, host, serviceName } = require('./configs/global_config');
const logger = require('./utils/logger');
// const ClientError = require('./exceptions/ClientError');

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
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./modules/authentications/validator');

const ctx = 'server';

const init = async () => {
  const songService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

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
  ]);

  await server.start();
  logger.info(ctx, `${serviceName} started, listening at ${server.info.uri}`, 'server.start');
};

init();
