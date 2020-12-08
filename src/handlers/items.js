const { logger } = require("../logger");
const raidbots = require("../providers/raidbots");
const database = require("../providers/database");

// updates item database with data from raidbots
async function updateItems() {
  try {
    logger.debug("[Items] ", "Updating all items");

    const items = await raidbots.getAllItems();

    // await database.upsertItems(items);
    logger.info("[Items] ", `${items.length} items updated`);
  } catch (e) {
    logger.error("[Items] ", e);
  }
}

module.exports = {
  updateItems,
};
