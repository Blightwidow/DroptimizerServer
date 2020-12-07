const express = require("express");
const router = express.Router();
const { db } = require("../database");

// gets all characters
router.get("/$", function (req, res) {
  const sql = "SELECT * FROM characters;";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    console.log(rows.length);
    res.json(rows);
  });
});

// gets a character by name
router.get("/:name", function (req, res) {
  const sql = "SELECT * FROM characters WHERE name=? COLLATE NOCASE;";
  db.get(sql, [req.params.name], (err, row) => {
    if (err) {
      throw err;
    }
    res.json(row);
  });
});

module.exports = router;
