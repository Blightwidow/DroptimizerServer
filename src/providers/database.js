const { db } = require("../database");

async function getAllCharacters() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM characters;", [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function getCharacterByName(charName) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM characters WHERE name=? COLLATE NOCASE;",
      [charName],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

async function upsertCharacter(name, lastModified, classId) {
  const user = getCharacterByName(name);

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO characters(
        id,
        lastModified,
        name,
        class,
        thumbnail) VALUES(?, ?, ?, ?, ?);`,
      [user ? user.id : null, lastModified, name, classId, "thumbnail"],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

async function getItemsById(itemID) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM items WHERE id=?;", [itemID], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function upsertItems(items) {
  return new Promise((resolve) => {
    db.run("BEGIN TRANSACTION;");
    for (let i = 0; i < items.length; i++) {
      const sql =
        "INSERT OR REPLACE INTO items(id, name, icon, quality, itemLevel) VALUES (?, ?, ?, ?, ?);";
      const params = [
        items[i].id,
        items[i].name,
        items[i].icon,
        items[i].quality,
        items[i].itemLevel,
      ];
      db.run(sql, params);
    }
    db.run("COMMIT TRANSACTION;");
    resolve();
  });
}

async function getAllUpgrades() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM upgrades;", [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function getUpgradeByItem(charName, itemID) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT *
    FROM upgrades
    JOIN characters ON upgrades.characterID = characters.id
    WHERE characters.name=? COLLATE NOCASE
    AND upgrades.itemID=?;`,
      [charName, itemID],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

function upsertUpgrade(charID, result, baseDps, reportID, spec, timeStamp) {
  const nameParts = result.name.split("/");
  const itemID = nameParts[3];
  console.log(
    "[Upgrade] ",
    charID,
    result.mean,
    baseDps,
    reportID,
    spec,
    timeStamp
  );

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO upgrades(
          characterID,
          itemID,
          reportID,
          dps,
          baseDps,
          spec,
          timeStamp) VALUES(?, ?, ?, ?, ?, ?, ?);`,
      [charID, itemID, reportID, result.mean, baseDps.mean, spec, timeStamp],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

async function deleteUpgradeByName(charName) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM upgrades WHERE characterID = (SELECT id FROM characters WHERE name = ?);",
      [charName],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

module.exports = {
  // Characters
  getAllCharacters,
  getCharacterByName,
  upsertCharacter,
  // Items
  getItemsById,
  upsertItems,
  // Upgrades
  getAllUpgrades,
  getUpgradeByItem,
  upsertUpgrade,
  deleteUpgradeByName,
};
