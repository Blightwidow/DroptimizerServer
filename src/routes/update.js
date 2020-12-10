import express from "express";
const router = express.Router();

import { updateSimReport } from "../handlers/simulation.js";
import * as databaseProvider from "../providers/database.js";

// express routes
router.get("/report/:reportID", async function (req, res) {
  await updateSimReport(req.params.reportID);
  res.json(`Parsing report with id ${req.params.reportID}`);
});

router.post("/simc/", async function (req, res) {
  const [, charName] = req.body.text.match(/^.+="([^"]+)"/m);

  await databaseProvider.upsertSimc(charName, req.body.text);

  res.json(`Parsing simC`);
});

export default router;
