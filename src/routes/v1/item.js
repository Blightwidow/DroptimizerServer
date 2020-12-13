import express from "express";
const router = express.Router();

import logger  from "../../logger.js";
import * as databaseProvider from "../../providers/database.js";

// gets an itme by id
router.get("/:itemID", async function (req, res) {
  try {
    const character = await databaseProvider.getItemById(req.params.itemID);

    res.json(character);
  } catch (error) {
    logger.error("[Items] ", `Error getting items ${req.params.itemID}`, error);
  }
});

export default router;
