const express = require("express");
const router = express.Router();
const { db } = require("../database");

// get all upgrades
router.get("/$", function (req, res) {
  const sql = "SELECT * FROM upgrades;";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// gets an upgrade by id and character name
router.get("/:name/:itemID", function (req, res) {
  const sql = `SELECT *
                FROM upgrades
                JOIN characters ON upgrades.characterID = characters.id
                WHERE characters.name=? COLLATE NOCASE
                AND upgrades.itemID=?;`;
  db.get(sql, [req.params.name, req.params.itemID], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

module.exports = router;
