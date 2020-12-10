import { getDb } from "../database.js";

export async function getAllCharacters() {
  const db = await getDb();

  return db.all("SELECT * FROM characters;");
}

export async function getCharacterByName(charName) {
  const db = await getDb();

  return db.get("SELECT * FROM characters WHERE name=? COLLATE NOCASE;", [
    charName,
  ]);
}

export async function upsertCharacter(name, lastModified, classId) {
  const user = await getCharacterByName(name);
  const db = await getDb();

  return db.run(
    `INSERT OR REPLACE INTO characters(
        id,
        lastModified,
        name,
        class,
        thumbnail) VALUES(?, ?, ?, ?, ?);`,
    [user ? user.id : null, lastModified, name, classId, "thumbnail"]
  );
}

export async function deleteCharacterByName(charName) {
  const db = await getDb();

  return db.run(`DELETE FROM characters WHERE name = ? COLLATE NOCASE;`, [
    charName,
  ]);
}

export async function getItemsById(itemID) {
  const db = await getDb();

  return db.get("SELECT * FROM items WHERE id=?;", [itemID]);
}

export async function upsertItems(items) {
  const db = await getDb();

  await db.run("BEGIN TRANSACTION;");
  for (let i = 0; i < items.length; i++) {
    const sql =
      "INSERT OR REPLACE INTO items(id, name, icon, quality, itemLevel) VALUES (?, ?, ?, ?, ?);";
    const params = [
      items[i].id,
      items[i].name,
      items[i].icon || "",
      items[i].quality,
      items[i].itemLevel,
    ];
    await db.run(sql, params);
  }
  return db.run("COMMIT;");
}

export async function getAllUpgrades() {
  const db = await getDb();

  return db.all("SELECT * FROM upgrades;");
}

export async function getUpgradeByItem(charName, itemID) {
  const db = await getDb();

  return db.get(
    `SELECT *
    FROM upgrades
    JOIN characters ON upgrades.characterID = characters.id
    WHERE characters.name=? COLLATE NOCASE
    AND upgrades.itemID=?;`,
    [charName, itemID]
  );
}

export async function upsertUpgrade(
  charID,
  result,
  baseDps,
  reportID,
  spec,
  timeStamp
) {
  const nameParts = result.name.split("/");
  const itemID = nameParts[3];
  const db = await getDb();

  return db.run(
    `INSERT OR REPLACE INTO upgrades(
          characterID,
          itemID,
          reportID,
          dps,
          baseDps,
          spec,
          timeStamp) VALUES(?, ?, ?, ?, ?, ?, ?);`,
    [charID, itemID, reportID, result.mean, baseDps.mean, spec, timeStamp]
  );
}

export async function deleteUpgradeByName(charName) {
  const db = await getDb();

  return db.run(
    "DELETE FROM upgrades WHERE characterID = (SELECT id FROM characters WHERE name = ?);",
    [charName]
  );
}

export async function getSimcByUserId(userId) {
  const db = await getDb();

  return db.get("SELECT * FROM simc WHERE characterID=?;", [userId]);
}

export async function getSimcByUserName(charName) {
  const db = await getDb();

  return db.get(
    `SELECT simc.* FROM simc
    INNER JOIN characters ON simc.characterID = characters.id
    WHERE characters.name=? COLLATE NOCASE;`,
    [charName]
  );
}

export async function upsertSimc(charName, text) {
  const db = await getDb();
  const user = await getCharacterByName(charName);
  const simc = await getSimcByUserId(user.id);

  return db.run(
    `INSERT OR REPLACE INTO simc(
        id,
        characterID,
        text) VALUES(?, ?, ?);`,
    [simc ? simc.id : null, user.id, text]
  );
}
