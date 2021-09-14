const Hapi = require('@hapi/hapi');

const { port, host, serviceName } = require('./configs/global_config');
const song = require('./modules/songs/api');
const SongService = require('./modules/songs/services/SongsService');
const SongValidator = require('./modules/songs/validator');
const logger = require('./utils/logger');

const ctx = 'server';

const init = async () => {
  const songService = new SongService();
  const server = Hapi.server({
    port,
    host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: song,
    options: {
      service: songService,
      validator: SongValidator,
    },
  });

  await server.start();
  logger.info(ctx, `${serviceName} started, listening at ${server.info.uri}`, 'server.start');
};

init();
