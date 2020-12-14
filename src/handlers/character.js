import logger from "../logger.js";
import * as databaseProvider from "../providers/database.js";
import * as blizzardProvider from "../providers/blizzard.js";

// updates/adds a character in/to the database with new data from battle.net
export async function updateCharacter(charName) {
  try {
    logger.debug("[Character] ", `Updating character: ${charName}`);
    const data = await blizzardProvider.getCharacterData(charName);

    await databaseProvider.upsertCharacter(
      data.name,
      data.last_login_timestamp,
      data.character_class.id
    );
    logger.info("[Character] ", `Updated character: ${data.name}`);
  } catch (error) {
    logger.error("[Character] ", `Error updating ${charName} `, error);
    throw error;
  }
}

// updates every character in the database with new data from battle.net
export async function updateAllCharacters() {
  try {
    logger.debug("[Character] ", `Updating all character`);

    const users = await databaseProvider.getAllCharacters();

    return Promise.all(users.map((user) => updateCharacter(user.name)));
  } catch (error) {
    logger.error("[Character] ", `Error updating all users `, error);
    throw error;
  }
}
