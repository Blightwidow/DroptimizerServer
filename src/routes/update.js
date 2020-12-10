import express from "express";
const router = express.Router();

import { updateSimReport } from "../handlers/simulation.js";

// express routes
router.get("/report/:reportID", async function (req, res) {
  await updateSimReport(req.params.reportID);
  res.json(`Parsing report with id ${req.params.reportID}`);
});

export default router;
