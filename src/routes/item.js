const express = require("express");
const router = express.Router();

const { logger } = require("../logger");
const databaseProvider = require("../providers/database");

// gets an itme by id
router.get("/:itemID", async function (req, res) {
  try {
    const character = await databaseProvider.getItemsById(req.params.itemID);

    res.json(character);
  } catch (error) {
    logger.error("[Items] ", `Error getting items ${req.params.itemID}`, error);
  }
});

module.exports = router;
