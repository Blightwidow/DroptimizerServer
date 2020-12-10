import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import characterRoutes from "./src/routes/character.js";
import upgradeRoutes from "./src/routes/upgrade.js";
import itemRoutes from "./src/routes/item.js";
import updateRoutes from "./src/routes/update.js";
import { initCrons, initData } from "./src/cron.js";
import { initDatabase } from "./src/database.js";
import logger  from "./src/logger.js";

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
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.set(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, HEAD, OPTIONS"
  );
  res.set("Access-Control-Allow-Credentials", true);
  res.set("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  next();
});

app.use("/1/character", characterRoutes);
app.use("/1/upgrade", upgradeRoutes);
app.use("/1/item", itemRoutes);
app.use("/1/update", updateRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: {
      code: err.status,
      message: err.message,
    },
  });
});

process.on("uncaughtException", function (err) {
  logger.error("[Express] ", "Uncaught exception: " + err);

  process.exit(1);
});

export default app;
