import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import createHttpError from "http-errors";
dotenv.config();

import { initData } from "./src/cron.js";
import { initDatabase } from "./src/database.js";
import logger from "./src/logger.js";
import characterRoutes from "./src/routes/v1/character.js";
import upgradeRoutes from "./src/routes/v1/upgrade.js";
import itemRoutes from "./src/routes/v1/item.js";
import updateRoutes from "./src/routes/v1/update.js";
import v2PlayerRoutes from "./src/routes/v2/player.js";
import v2UpgradeRoutes from "./src/routes/v2/upgrade.js";
import v2ItemRoutes from "./src/routes/v2/item.js";
import v2InputRoutes from "./src/routes/v2/input.js";
import v2BossRoutes from "./src/routes/v2/boss.js";

// App init
initDatabase();
initData();
// initCrons();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  logger.debug("[Express] ", req.method, " ", req.path);
  next();
});

app.use((req, res, next) => {
  res.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.set(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, HEAD, OPTIONS"
  );
  res.set("Access-Control-Allow-Credentials", true);
  res.set("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  next();
});

// API v1 routes
app.use("/1/character", characterRoutes);
app.use("/1/upgrade", upgradeRoutes);
app.use("/1/item", itemRoutes);
app.use("/1/update", updateRoutes);

// API v2 routes
app.use("/v2/players", v2PlayerRoutes);
app.use("/v2/upgrades", v2UpgradeRoutes);
app.use("/v2/items", v2ItemRoutes);
app.use("/v2/bosses", v2BossRoutes);
app.use("/v2/inputs", v2InputRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createHttpError.NotFound());
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  const errStatus = err.status || 500;
  logger.warn("[Express] Error ", errStatus, " on path ", req.path);

  // render the error page
  res.status(errStatus);

  if (errStatus < 500 || err.expose) {
    res.send(err.message);
  } else {
    res.send("An error has occured");
  }
});

process.on("uncaughtException", function (err) {
  logger.error("[Express] ", "Uncaught exception: " + err);

  process.exit(1);
});

export default app;
