const { logger } = require("../logger");
const blizzard = require("../providers/blizzard");
const database = require("../providers/database");

// updates/adds a character in/to the database with new data from battle.net
async function updateCharacter(charName) {
  try {
    logger.debug("[Character] ", `Updating character: ${charName}`);
    const data = await blizzard.getCharacterData(charName);

    await database.upsertCharacter(
      data.name,
      data.last_login_timestamp,
      data.character_class.id
    );
    logger.info("[Character] ", `Updated character: ${data.name}`);
  } catch (e) {
    logger.error("[Character] ", `Error updating ${charName} `, e);
  }
}

// updates every character in the database with new data from battle.net
async function updateAllCharacters() {
  try {
    logger.debug("[Character] ", `Updating all character`);

    const users = database.getAllCharacters();

    return Promise.all(users.map((user) => updateCharacter(user.name)));
  } catch (e) {
    logger.error("[Character] ", `Error updating all users `, e);
  }
}

module.exports = {
  updateAllCharacters,
  updateCharacter,
};
