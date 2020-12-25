import cron from "node-cron";

import logger from "./logger.js";
import { queueAllSims } from "./handlers/simulation.js";
import { updateItems } from "./handlers/items.js";

export async function initData() {
  try {
    await updateItems();
    await queueAllSims();
  } catch (e) {
    logger.error("[Data] ", e);
  }
}

export function initCrons() {
  // start new droptimizer sims at 5:00am every day
  cron.schedule(
    "0 5 * * *",
    function () {
      logger.warn("[CRON] ", "Running character sims");

      queueAllSims();
    },
    { timezone: process.env.TIMEZONE }
  );

  // update items at 4:00am every day
  cron.schedule(
    "0 0 1 * *",
    function () {
      logger.warn("[CRON] ", "Updating items");

      updateItems();
    },
    { timezone: process.env.TIMEZONE }
  );
}
