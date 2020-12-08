const express = require("express");
const router = express.Router();

const { updateSimReport } = require("../handlers/simulation");

// express routes
router.get("/report/:reportID", async function (req, res) {
  await updateSimReport(req.params.reportID);
  res.json(`Parsing report with id ${req.params.reportID}`);
});

module.exports = router;
