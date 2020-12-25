import PQueue from "p-queue";

import { updateCharacter } from "./character.js";
import logger from "../logger.js";
import * as databaseProvider from "../providers/database.js";
import * as raidbotsProvider from "../providers/raidbots.js";

const raidbotQueue = new PQueue.default({ concurrency: 1 });

function mapWeaponToToken(upgrade, user) {
  const MAPPING = [
    {
      tokenId: 183892,
      classes: [8, 3, 11],
      itemIds: [182422, 182418, 182424, 182417, 182419],
    },
    {
      tokenId: 183897,
      classes: [8, 3, 11],
      itemIds: [182392, 182396, 182398, 182391, 182393],
    },
    {
      tokenId: 183893,
      classes: [6, 9, 12],
      itemIds: [182421, 182415, 182422, 182418, 182416, 182420, 182423],
    },
    {
      tokenId: 183896,
      classes: [6, 9, 12],
      itemIds: [182395, 182389, 182392, 182396, 182390, 182394, 182397],
    },
    {
      tokenId: 183888,
      classes: [2, 10, 1, 5],
      itemIds: [182425, 182426],
    },
    {
      tokenId: 183895,
      classes: [2, 10, 1, 5],
      itemIds: [182399, 182400],
    },
    {
      tokenId: 183891,
      classes: [2, 5, 7],
      itemIds: [182417, 182422, 182421, 182415, 182418, 182416],
    },
    {
      tokenId: 183898,
      classes: [2, 5, 7],
      itemIds: [182391, 182396, 182395, 182389, 182392, 182390],
    },
    {
      tokenId: 183889,
      classes: [7, 8, 9, 11],
      itemIds: [182425, 182426],
    },
    {
      tokenId: 183894,
      classes: [7, 8, 9, 11],
      itemIds: [182399, 182400],
    },
    {
      tokenId: 183890,
      classes: [1, 4, 10],
      itemIds: [
        182416,
        182420,
        182419,
        182417,
        182422,
        182418,
        182415,
        182421,
        182414,
      ],
    },
    {
      tokenId: 183899,
      classes: [1, 4, 10],
      itemIds: [
        182390,
        182394,
        182393,
        182391,
        182396,
        182392,
        182395,
        182389,
        182388,
      ],
    },
  ];
  const nameParts = upgrade.name.split("/");
  const initialId = Number.parseInt(nameParts[3]);

  const nextItemId = MAPPING.reduce(
    (acc, mappingElement) =>
      mappingElement.itemIds.includes(initialId) &&
      mappingElement.classes.includes(user.class)
        ? mappingElement.tokenId
        : acc,
    initialId
  );

  return { ...upgrade, itemID: nextItemId };
}

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
      Object.values(upgrades)
        .map((upgrade) => mapWeaponToToken(upgrade, user))
        .map((result) =>
          databaseProvider.upsertUpgrade(
            user.id,
            result.itemID,
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
