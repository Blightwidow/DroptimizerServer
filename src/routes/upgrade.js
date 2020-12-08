const express = require("express");
const router = express.Router();

const { logger } = require("../logger");
const databaseProvider = require("../providers/database");

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

module.exports = router;
