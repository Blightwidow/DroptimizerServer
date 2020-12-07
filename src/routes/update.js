const express = require("express");
const router = express.Router();

const { db } = require("../database");
const {
  runAllSims,
  runSim,
  updateSimReport,
  updateCharacter,
  updateAllCharacters,
} = require("../dataUpdater");

// express routes
router.get("/report/:reportID", function (req, res) {
  updateSimReport(req.params.reportID);
  res.json(`Parsing report with id ${req.params.reportID}`);
});

router.get("/sim/:charName", function (req, res) {
  runSim(req.params.charName);
  res.json(
    `Sim Started for ${req.params.charName}. New upgrades should be ready in 10 minutes.`
  );
});

router.get("/all/sim$", function (req, res) {
  runAllSims();
  res.json(`Sim started for all characters. This could take a while.`);
});

router.get("/remove/character/:charName", function (req, res) {
  db.run("DELETE FROM characters WHERE name=? COLLATE NOCASE;", [
    req.params.charName,
  ]);

  res.json(`Character ${req.params.charName} has been removed.`);
});

router.get("/character/:charName", function (req, res) {
  updateCharacter(req.params.charName);
  res.json(`Character ${req.params.charName} has been updated.`);
});

router.get("/all/character$", function (req, res) {
  updateAllCharacters();
  res.json(`All characters have been updated.`);
});

module.exports = router;
