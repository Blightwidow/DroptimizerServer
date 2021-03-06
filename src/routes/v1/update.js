import express from "express";
const router = express.Router();

import { updateCharacter } from "../../handlers/character.js";
import { queueSim, queueSimReport } from "../../handlers/simulation.js";
import * as databaseProvider from "../../providers/database.js";
import { canWriteSimc, isAdmin, jwtCheck } from "../../auth.js";

// express routes
router.post("/report/", jwtCheck, isAdmin, async function (req, res) {
  const reportID = req.body.reportID;

  await queueSimReport(reportID);
  res.json(`Parsed report with id ${reportID}`);
});

router.post("/simc/", jwtCheck, canWriteSimc, async function (req, res, next) {
  try {
    const [, charName] = req.body.text.match(/^.+="([^"]+)"/m);

    await updateCharacter(charName);
    await databaseProvider.upsertSimc(charName, req.body.text);
    await queueSim(charName);

    res.json(`Queued simC`);
  } catch (error) {
    next(error);
  }
});

export default router;
