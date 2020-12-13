import cron from "node-cron";

import logger from "./logger.js";
import { updateAllCharacters } from "./handlers/character.js";
import { queueAllSims } from "./handlers/simulation.js";
import { updateItems } from "./handlers/items.js";

export async function initData() {
  try {
    await updateItems();
  } catch (e) {
    logger.error("[Data] ", e);
  }
}

export function initCrons() {
  // update all characters every hour with new data from battle.net
  cron.schedule(
    "0 * * * *",
    function() {
      logger.warn("[CRON] ", "Updating Characters");

      updateAllCharacters();
    },
    { timezone: process.env.TIMEZONE }
  );

  // start new droptimizer sims at 5:00am every day
  cron.schedule(
    "0 5 * * *",
    function() {
      logger.warn("[CRON] ", "Running character sims");

      queueAllSims();
    },
    { timezone: process.env.TIMEZONE }
  );

  // update items at 4:00am every day
  cron.schedule(
    "0 4 * * *",
    function() {
      logger.warn("[CRON] ", "Updating items");

      updateItems();
    },
    { timezone: process.env.TIMEZONE }
  );
}
