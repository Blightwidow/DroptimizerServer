import express from "express";
import createHttpError from "http-errors";
const router = express.Router();

import logger from "../../logger.js";
import * as databaseProvider from "../../providers/database.js";

// gets all players
router.get("/$", async function(req, res) {
  try {
    const players = await databaseProvider.getAllCharacters();

    res.json(players);
  } catch (error) {
    logger.error("[Character] ", `Error getting all player`, error);
    throw error;
  }
});

// gets a player by name
router.get("/:name", async function(req, res) {
  try {
    const player = await databaseProvider.getCharacterByName(req.params.name);

    if (!player) {
      throw createHttpError.NotFound();
    }

    res.json(player);
  } catch (error) {
    logger.error("[Character] ", `Error getting player`, error);
    throw error;
  }
});

// delete a player by name
router.delete("/:name", async function(req, res) {
  try {
    const player = await databaseProvider.deleteCharacterByName(
      req.params.name
    );

    res.json(player);
  } catch (error) {
    logger.error("[Character] ", `Error deleting player`, error);
    throw error;
  }
});

export default router;
