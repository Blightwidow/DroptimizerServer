const express = require("express");
const router = express.Router();

const { logger } = require("../logger");
const databaseProvider = require("../providers/database");

// gets all characters
router.get("/$", async function (req, res) {
  try {
    const characters = await databaseProvider.getAllCharacters();

    res.json(characters);
  } catch (error) {
    logger.error("[Character] ", `Error getting all character`, error);
  }
});

// gets a character by name
router.get("/:name", async function (req, res) {
  try {
    const character = await databaseProvider.getCharacterByName(
      req.params.name
    );

    res.json(character);
  } catch (error) {
    logger.error(
      "[Character] ",
      `Error getting character ${req.params.name}`,
      error
    );
  }
});

// delete a character by name
router.delete("/:name", async function (req, res) {
  try {
    const character = await databaseProvider.deleteCharacterByName(
      req.params.name
    );

    res.json(character);
  } catch (error) {
    logger.error(
      "[Character] ",
      `Error deleting character ${req.params.name}`,
      error
    );
  }
});

module.exports = router;
