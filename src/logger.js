const logger = require("simple-node-logger").createSimpleLogger();

logger.setLevel(process.env.LOGGER_LEVEL || 'info');

module.exports = {
  logger,
};
