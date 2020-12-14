import express from "express";
import createHttpError from "http-errors";
const router = express.Router();

import logger from "../../logger.js";
import { updateSimReport, generateSim } from "../../handlers/simulation.js";
import * as databaseProvider from "../../providers/database.js";

// express routes
router.post("/report", async function(req, res) {
  try {
    if (!req.body.reportID) {
      throw createHttpError.BadRequest();
    }

    await updateSimReport(req.body.reportID);

    res.json(`Parsed report with id ${req.body.reportID}`);
  } catch (error) {
    logger.error("[Input] ", `Error adding report`, error);
    throw error;
  }
});

router.post("/simc", async function(req, res) {
  try {
    if (!req.body.text) {
      throw createHttpError.BadRequest();
    }

    const [, charName] = req.body.text.match(/^.+="([^"]+)"/m);

    if (!req.body.itemIDs) {
      throw createHttpError.BadRequest();
    }

    await databaseProvider.upsertSimc(charName, req.body.text);
    await generateSim(charName);

    res.json(`Parsed simC`);
  } catch (error) {
    logger.error("[Input] ", `Error adding simc`, error);
    throw error;
  }
});

export default router;
