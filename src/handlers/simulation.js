import PQueue from "p-queue";

import { updateCharacter } from "./character.js";
import logger from "../logger.js";
import * as databaseProvider from "../providers/database.js";
import * as raidbotsProvider from "../providers/raidbots.js";

const raidbotQueue = new PQueue.default({ concurrency: 1 });

async function generateSim(charName) {
  try {
    logger.debug("[Simulation] ", `Starting new sim for ${charName}`);
    const reportId = await raidbotsProvider.getNewSimId(charName);

    queueSimReport(reportId);
    logger.info("[Simulation] ", `Started new sim with ID: ${reportId} `);
  } catch (error) {
    logger.error("[Simulation] ", error);
    throw error;
  }
}

export async function queueSimReport(reportId) {
  setTimeout(() => {
    raidbotQueue.add(() => updateSimReport(reportId));
    logger.debug("[Simulation] ", `Queued simulation report for ${reportId}`);
  }, 1000 * 60 * 5);
}

export async function queueSim(charName) {
  raidbotQueue.add(() => generateSim(charName));
  logger.debug("[Simulation] ", `Queued simulation for ${charName}`);
}

export async function queueAllSims() {
  logger.debug("[Simulation] ", `Queuing all simulations`);
  const users = await databaseProvider.getAllCharacters();

  return Promise.all(users.map((user) => queueSim(user.name)));
}

async function updateSimReport(reportID) {
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

    await Promise.all(
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
  } catch (error) {
    logger.error("[Simulation] ", error);
    throw error;
  }
}
