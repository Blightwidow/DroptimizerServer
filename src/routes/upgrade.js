import express from "express";
const router = express.Router();

import logger  from "../logger.js";
import * as databaseProvider from "../providers/database.js";

router.get("/$", async function (req, res) {
  try {
    const upgrades = await databaseProvider.getAllUpgrades();

    res.json(upgrades);
  } catch (error) {
    logger.error("[Upgrades] ", `Error getting all upgrades`, error);
  }
});

router.get("/:name/:itemID", async function (req, res) {
  try {
    const upgrade = await databaseProvider.getUpgradeByItem(
      req.params.name,
      req.params.itemID
    );

    res.json(upgrade);
  } catch (error) {
    logger.error(
      "[Upgrades] ",
      `Error getting upgrade for ${req.params.name} & ${req.params.itemID}`,
      error
    );
  }
});

export default router;
