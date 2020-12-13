import express from "express";
const router = express.Router();

import logger from "../../logger.js";
import createHttpError from "http-errors";

const BOSSES = [];

// gets all bosses
router.get("/$", async function (req, res) {
  try {
    res.json(BOSSES);
  } catch (error) {
    logger.error("[Boss] ", `Error getting all bosses`, error);
    throw error;
  }
});

// gets a boss by name
router.get("/:name", async function (req, res) {
  try {
    const boss = BOSSES.find((boss) => boss.name === req.params.name);

    if (!boss) {
      throw createHttpError.NotFound();
    }

    res.json(boss);
  } catch (error) {
    logger.error("[Boss] ", `Error getting boss`, error);
    throw error;
  }
});

export default router;
