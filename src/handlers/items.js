import logger from "../logger.js";
import * as databaseProvider from "../providers/database.js";
import * as raidbotsProvider from "../providers/raidbots.js";

// updates item database with data from raidbots
export async function updateItems() {
  try {
    logger.debug("[Items] ", "Updating all items");

    const items = await raidbotsProvider.getAllItems();

    await databaseProvider.upsertItems(items);
    logger.info("[Items] ", `${items.length} items updated`);
  } catch (error) {
    logger.error("[Items] ", error);
    throw error;
  }
}
