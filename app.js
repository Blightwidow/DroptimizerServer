require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const characterRoutes = require("./src/routes/character");
const upgradeRoutes = require("./src/routes/upgrade");
const itemRoutes = require("./src/routes/item");
const updateRoutes = require("./src/routes/update");
const { initCrons, initData } = require("./src/dataUpdater");
const { initDatabase } = require("./src/database");

// App init
initDatabase();
initData();
initCrons();
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
  console.log("Uncaught exception: " + err);

  process.exit(1);
});

module.exports = app;
