const express = require("express");
const router = express.Router();
const { db } = require("../database");

// gets an itme by id
router.get("/:itemID", function (req, res) {
  const sql = "SELECT * FROM items WHERE id=?;";
  db.get(sql, [req.params.itemID], (err, row) => {
    if (err) {
      throw err;
    }
    res.json(row);
  });
});

module.exports = router;
