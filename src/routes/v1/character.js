import express from "express";
const router = express.Router();

import logger from "../../logger.js";
import { isAdmin, jwtCheck } from "../../auth.js";
import * as databaseProvider from "../../providers/database.js";

// gets all characters
router.get("/$", async function (req, res, next) {
  try {
    const characters = await databaseProvider.getAllCharacters();

    res.json(characters);
  } catch (error) {
    logger.error("[Character] ", `Error getting all character`, error);
    next(error);
  }
});

// gets a character by name
router.get("/:name", async function (req, res, next) {
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
    next(error);
  }
});

// delete a character by name
router.delete("/:name", jwtCheck, isAdmin, async function (req, res, next) {
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
    next(error);
  }
});

export default router;
