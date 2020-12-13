import { updateCharacter } from "./character.js";
import logger from "../logger.js";
import * as databaseProvider from "../providers/database.js";
import * as raidbotsProvider from "../providers/raidbots.js";

// runs a raidbotsProvider sim for the given character
export async function generateSim(charName) {
  try {
    logger.debug("[Simulation] ", `Starting new sim: ${charName}`);
    const reportId = await raidbotsProvider.getNewSimId(charName);

    setTimeout(function () {
      // let raidbotsProvider have 10 mins to process the sim
      updateSimReport(reportId);
    }, 1000 * 60 * 3);
    logger.info("[Simulation] ", `Queued new sim with ID: ${reportId} `);
  } catch (e) {
    logger.error("[Simulation] ", e);
  }
}

export async function queueAllSims() {
  logger.debug("[Simulation] ", `Starting all simulations`);
  const users = await databaseProvider.getAllCharacters();

  return Promise.all(users.map((user) => generateSim(user.name)));
}

export async function updateSimReport(reportID) {
  try {
    logger.debug(
      "[Simulation] ",
      `Fetching raidbotsProvider report ${reportID}`
    );

    const report = await raidbotsProvider.getSimReport(reportID);
    const charName = report.simbot.meta.rawFormData.character.name;

    // delete all current upgrades for this report's character
    await databaseProvider.deleteUpgradeByName(charName);

    // ensure the character is up to date
    await updateCharacter(charName);
    // get the character id
    const user = await databaseProvider.getCharacterByName(charName);

    logger.info("[Simulation] ", `Digested report: ${charName}`);
    const upgrades = report.sim.profilesets.results.reduce((acc, upgrade) => {
      const itemId = upgrade.name.split("/")[3];
      if (acc[itemId] && acc[itemId].mean > upgrade.mean) {
        return acc;
      }

      return { ...acc, [itemId]: upgrade };
    }, {});

    return Promise.all(
      Object.values(upgrades).map((result) =>
        databaseProvider.upsertUpgrade(
          user.id,
          result,
          report.sim.players[0].collected_data.dps,
          reportID,
          report.sim.players[0].specialization,
          report.simbot.date
        )
      )
    );
  } catch (e) {
    logger.error("[Simulation] ", e);
  }
}
