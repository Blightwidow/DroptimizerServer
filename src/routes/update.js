import express from "express";
const router = express.Router();

import { updateSimReport, runSim } from "../handlers/simulation.js";
import * as databaseProvider from "../providers/database.js";

// express routes
router.post("/report/", async function (req, res) {
  const reportID = req.body.reportID;

  await updateSimReport(reportID);
  res.json(`Parsed report with id ${reportID}`);
});

router.post("/simc/", async function (req, res) {
  const [, charName] = req.body.text.match(/^.+="([^"]+)"/m);

  await databaseProvider.upsertSimc(charName, req.body.text);
  await runSim(charName);

  res.json(`Parsed simC`);
});

export default router;
