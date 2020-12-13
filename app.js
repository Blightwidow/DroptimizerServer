import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "express-jwt";
import jwks from "jwks-rsa";
import createHttpError from "http-errors";
dotenv.config();

import { initCrons, initData } from "./src/cron.js";
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
initCrons();
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

// Authentication
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://blightwidow.eu.auth0.com/.well-known/jwks.json",
  }),
  audience: "https://api.loot.odrel.com",
  issuer: "https://blightwidow.eu.auth0.com/",
  algorithms: ["RS256"],
});

app.use(jwtCheck.unless({ method: ["GET"], path: ["/v2/item/bulk"] }));

// API v1 routes
app.use("/1/character", characterRoutes);
app.use("/1/upgrade", upgradeRoutes);
app.use("/1/item", itemRoutes);
app.use("/1/update", updateRoutes);

// API v2 routes
app.use("/v2/player", v2PlayerRoutes);
app.use("/v2/upgrade", v2UpgradeRoutes);
app.use("/v2/item", v2ItemRoutes);
app.use("/v2/boss", v2BossRoutes);
app.use("/v2/inpuit", v2InputRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createHttpError.NotFound());
});

// error handler
app.use(function (err, req, res, next) {
  const errStatus = err.status || 500;
  logger.warn("[Express] Error ", errStatus, ' on path ', req.path);

  // render the error page
  res.status(errStatus);

  if (err.expose) {
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
