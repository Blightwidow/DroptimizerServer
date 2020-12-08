const { updateCharacter } = require("./character");
const { logger } = require("../logger");
const database = require("../providers/database");
const raidbots = require("../providers/raidbots");

// runs a raidbots sim for the given character
async function runSim(charName) {
  try {
    logger.debug("[Simulation] ", `Starting new sim: ${charName}`);
    const reportId = await raidbots.getNewSimId(charName);

    setTimeout(function () {
      // let raidbots have 10 mins to process the sim
      updateSimReport(reportId);
    }, 1000 * 60 * 3);
    logger.info("[Simulation] ", `Queued new sim with ID: ${reportId} `);
  } catch (e) {
    logger.error("[Simulation] ", e);
  }
}

async function runAllSims() {
  logger.debug("[Simulation] ", `Starting all simulations`);
  const users = await database.getAllCharacters();

  return Promise.all(users.map((user) => runSim(user.name)));
}

async function updateSimReport(reportID) {
  try {
    logger.debug("[Simulation] ", `Fetching raidbots report ${reportID}`);

    const report = await raidbots.getSimReport(reportID);
    const charName = report.simbot.meta.rawFormData.character.name;

    // delete all current upgrades for this report's character
    await database.deleteUpgradeByName(charName);

    // ensure the character is up to date
    await updateCharacter(charName);
    // get the character id
    const user = await database.getCharacterByName(charName);

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
        database.upsertUpgrade(
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

module.exports = {
  updateSimReport,
  runAllSims,
  runSim,
};
