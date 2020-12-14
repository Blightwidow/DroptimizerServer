import express from "express";
const router = express.Router();

import logger from "../../logger.js";
import * as databaseProvider from "../../providers/database.js";
import createHttpError from "http-errors";

router.get("/search/:searchTerm", async function(req, res) {
  try {
    const items = await databaseProvider.searchItemsByName(
      req.params.searchTerm
    );

    res.json(items);
  } catch (error) {
    logger.error("[Items] ", `Error getting item by name`, error);
    throw error;
  }
});

// gets an itme by id
router.get("/:itemID", async function(req, res) {
  try {
    const item = await databaseProvider.getItemById(req.params.itemID);

    if (!item) {
      throw createHttpError.NotFound();
    }

    res.json(item);
  } catch (error) {
    logger.error("[Items] ", `Error getting item`, error);
    throw error;
  }
});

export default router;
