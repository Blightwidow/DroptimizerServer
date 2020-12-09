const cron = require("node-cron");

const { logger } = require("./logger");
const { updateAllCharacters } = require("./handlers/character");
const { runAllSims } = require("./handlers/simulation");
const { updateItems } = require("./handlers/items");

async function initData() {
  try {
    await updateItems();
  } catch (e) {
    logger.error("[Data] ", e);
  }
}

function initCrons() {
  // update all characters every hour with new data from battle.net
  cron.schedule(
    "0 * * * *",
    function () {
      logger.warn("[CRON] ", "Updating Characters");

      updateAllCharacters();
    },
    { timezone: process.env.TIMEZONE }
  );

  // start new droptimizer sims at 5:00am every day
  cron.schedule(
    "0 5 * * *",
    function () {
      logger.warn("[CRON] ", "Running character sims");

      runAllSims();
    },
    { timezone: process.env.TIMEZONE }
  );

  // update items at 4:00am every day
  cron.schedule(
    "0 4 * * *",
    function () {
      logger.warn("[CRON] ", "Updating items");

      updateItems();
    },
    { timezone: process.env.TIMEZONE }
  );
}

module.exports = {
  initData,
  initCrons,
};
