import logger from "simple-node-logger";

const instance = logger.createSimpleLogger();
instance.setLevel(process.env.LOGGER_LEVEL || "info");

export default instance;
