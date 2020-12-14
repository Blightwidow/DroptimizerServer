import express from "express";
const router = express.Router();

import { updateCharacter } from "../../handlers/character.js";
import { updateSimReport, generateSim } from "../../handlers/simulation.js";
import * as databaseProvider from "../../providers/database.js";

// express routes
router.post("/report/", async function(req, res) {
  const reportID = req.body.reportID;

  await updateSimReport(reportID);
  res.json(`Parsed report with id ${reportID}`);
});

router.post("/simc/", async function(req, res) {
  const [, charName] = req.body.text.match(/^.+="([^"]+)"/m);

  await updateCharacter(charName);
  await databaseProvider.upsertSimc(charName, req.body.text);
  await generateSim(charName);

  res.json(`Queued simC`);
});

export default router;
