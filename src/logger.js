import logger from "simple-node-logger";
import dotenv from "dotenv";

dotenv.config();

const instance = logger.createSimpleLogger();
instance.setLevel(process.env.LOGGER_LEVEL || "info");

export default instance;
