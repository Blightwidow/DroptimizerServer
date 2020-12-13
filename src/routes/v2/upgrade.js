import express from "express";
import createHttpError from "http-errors";
const router = express.Router();

import logger from "../../logger.js";
import * as databaseProvider from "../../providers/database.js";

router.get("/$", async function (req, res) {
  try {
    const upgrades = await databaseProvider.getAllUpgrades();

    res.json(upgrades);
  } catch (error) {
    logger.error("[Upgrades] ", `Error getting all upgrades`, error);
    throw error;
  }
});

router.get("/:itemID", async function (req, res) {
  try {
    const upgrade = await databaseProvider.getUpgradeByItem(req.params.itemID);

    if (!upgrade) {
      throw createHttpError.NotFound();
    }

    res.json(upgrade);
  } catch (error) {
    logger.error("[Upgrades] ", `Error getting upgrade`, error);
    throw error;
  }
});

export default router;
