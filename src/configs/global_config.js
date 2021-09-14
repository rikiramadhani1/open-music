require('dotenv').config();

module.exports = {
  serviceName: process.env.SERVICE_NAME,
  host: process.env.HOST,
  port: process.env.PORT,
};
