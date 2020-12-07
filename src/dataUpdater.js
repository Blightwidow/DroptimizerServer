const request = require("request");
const puppeteer = require("puppeteer");
const cron = require("node-cron");
const blizzard = require("blizzard.js").initialize({
  key: process.env.WOW_API_CLIENTID,
  secret: process.env.WOW_API_CLIENTSECRET,
  origin: process.env.WOW_API_ORIGIN,
});

const { db } = require("./database");

let blizzardToken = "";

async function getCharacterData(charName) {
  return new Promise((resolve, reject) => {
    request.get(
      `https://${process.env.WOW_API_REGION}.api.blizzard.com/profile/wow/character/${process.env.WOW_API_REALM}/${charName}?namespace=profile-${process.env.WOW_API_REGION}&locale=en_US&access_token=${blizzardToken}`,
      function (error, response, body) {
        if (error) {
          reject(error);
        }

        if (response && response.statusCode === 200) {
          let report = JSON.parse(body);
          resolve(report);
        }
      }
    );
  });
}

// updates/adds a character in/to the database with new data from battle.net
async function updateCharacter(charName) {
  try {
    console.log(`Updating character: ${charName}`);
    const data = await getCharacterData(charName);

    db.get(
      "SELECT id FROM characters WHERE name=? COLLATE NOCASE;",
      [charName],
      function (err, row) {
        let params = [
          row ? row.id : null,
          data.last_login_timestamp,
          data.name,
          data.character_class.id,
          "https://placekitten.com/200/200",
        ];

        db.run(
          `INSERT OR REPLACE INTO characters(
          id,
          lastModified,
          name,
          class,
          thumbnail) VALUES(?, ?, ?, ?, ?);`,
          params
        );
      }
    );

    console.log(`Updated character: ${charName}`);

    return;
  } catch (e) {
    console.error(`Error updating ${charName}`, e);
  }
}

// updates every character in the database with new data from battle.net
async function updateAllCharacters() {
  db.all("SELECT name FROM characters;", [], (err, rows) => {
    if (err) {
      console.error('Failed to "SELECT * FROM characters":', err);
    }

    for (var i = 0; i < rows.length; i++) {
      updateCharacter(rows[i].name);
    }
  });
}

// runs a raidbots sim for the given character
async function runSim(charName) {
  console.log(`Starting new sim: ${charName}`);
  const uri = `https://www.raidbots.com/simbot/droptimizer?region=${process.env.WOW_API_REGION}&realm=${process.env.WOW_API_REALM}&name=${charName}`;
  const cookies = [
    {
      name: "raidsid",
      value: process.env.RAIDBOTS_COOKIE,
      domain: "www.raidbots.com",
    },
  ];

  // get a new page
  const browser = await puppeteer.launch().catch(function () {
    console.error("Failed to start a new browser");
  });
  if (browser) {
    const page = await browser.newPage().catch(function () {
      console.error("Failed to open a new page");
    });
    if (page) {
      await page.setCookie(...cookies).catch((e) => {
        console.error(e);
      });
      await page.goto(uri).catch((e) => {
        console.error(e);
      });
      setTimeout(async function () {
        // let raidbots have 3 secs to set up the page
        // select Raid
        await page
          .click(
            "section.Section:nth-child(3) > section:nth-child(1) > div:nth-child(2) > section:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)"
          )
          .catch((e) => {
            console.error(e);
          });
        // select Tier
        await page
          .click(
            "section.Section:nth-child(3) > section:nth-child(1) > div:nth-child(2) > section:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3)"
          )
          .catch((e) => {
            console.error(e);
          });
        // start the sim, twice bc it doesnt work otherwise
        await page
          .click(
            "#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(11) > div > div:nth-child(1) > button"
          )
          .catch((e) => {
            console.error(e);
          });
        await page.waitForNavigation().catch((e) => {
          console.error(e);
        });
        const reportID = page.url().split("/")[5];
        await page.close().catch((e) => {
          console.error(e);
        });
        await browser.close().catch((e) => {
          console.error(e);
        });
        console.log(`Queued new sim with ID: ${reportID} `);
        setTimeout(function () {
          // let raidbots have 10 mins to process the sim
          updateSimReport(reportID);
        }, 1000 * 60 * 10);
      }, 1000 * 3);
    }
  }
}

function runAllSims() {
  const DELAY_GAP = 60 * 1000 * 5; // 5 min delay between starting sims
  let lastDelay = 0;

  db.all("SELECT * FROM characters;", [], (err, rows) => {
    if (err) {
      throw err;
    }

    for (let i = 0; i < rows.length; i++) {
      setTimeout(function () {
        runSim(rows[i].name, rows[i].realm, rows[i].region);
      }, lastDelay);
      lastDelay += DELAY_GAP;
    }
  });
}

function insertUpgrade(charID, result, baseDps, reportID, spec, timeStamp) {
  function _insertUpgrade(charID, result, baseDps, reportID, spec, timeStamp) {
    const nameParts = result.name.split("/");
    const itemID = nameParts[2];
    const sql = `INSERT OR REPLACE INTO upgrades(
            characterID,
            itemID,
            reportID,
            dps,
            baseDps,
            spec,
            timeStamp) VALUES(?, ?, ?, ?, ?, ?, ?);`;
    const params = [
      charID,
      itemID,
      reportID,
      result.mean,
      baseDps.mean,
      spec,
      timeStamp,
    ];
    // check if this item is an azerite piece
    // if it is we can have multiple results with the same item id
    if (nameParts.length === 6) {
      // azerite items have an extra part for their trait config
      db.get(
        "SELECT * FROM upgrades WHERE characterID=? AND itemID=?;",
        [charID, itemID],
        function (err, row) {
          if (err) {
            throw err;
          }
          if (row) {
            // only insert the new data if it has a higher dps mean than the current
            if (row.mean < result.mean) {
              db.run(sql, params);
            }
          } else {
            db.run(sql, params);
          }
        }
      );
    } else {
      db.run(sql, params);
    }
  }
  // bodge to ensure highest azerite dps is always used
  _insertUpgrade(charID, result, baseDps, reportID, spec, timeStamp);
  _insertUpgrade(charID, result, baseDps, reportID, spec, timeStamp);
}

function updateSimReport(reportID) {
  // TODO: check if the report is a droptimier sim
  console.log(`Fetching raidbots report ${reportID}`);
  let uri = `https://www.raidbots.com/reports/${reportID}/data.json`;
  request.get(uri, function (error, response, body) {
    if (response && response.statusCode === 200) {
      let report = JSON.parse(body);
      let charName = report.simbot.meta.rawFormData.character.name;
      // delete all current upgrades for this report's character
      db.run(
        "DELETE FROM upgrades WHERE characterID = (SELECT id FROM characters WHERE name = ?);",
        [charName]
      );
      console.log(`Parsing report: ${charName}`);
      // ensure the character is up to date
      updateCharacter(charName);
      // get the character id
      let sql = "SELECT * FROM characters WHERE name=? COLLATE NOCASE;";
      db.get(sql, [charName], (err, row) => {
        if (err) {
          throw err;
        }
        for (var i = 0; i < report.sim.profilesets.results.length; i++) {
          insertUpgrade(
            row.id,
            report.sim.profilesets.results[i],
            report.sim.players[0].collected_data.dps,
            reportID,
            report.sim.players[0].specialization,
            report.simbot.date
          );
        }
      });
    } else {
      console.error(error);
    }
  });
}

// updates item database with data from raidbots
function updateItems() {
  const uri = "https://www.raidbots.com/static/data/live/equippable-items.json";
  request.get(uri, function (error, response, body) {
    if (response && response.statusCode === 200) {
      console.log("Got item data from raidbots");
      const items = JSON.parse(body);
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
      console.log(`${items.length} items updated`);
    } else {
      console.error(error);
    }
  });
}

async function initData() {
  try {
    const response = await blizzard.getApplicationToken({
      key: process.env.WOW_API_CLIENTID,
      secret: process.env.WOW_API_CLIENTSECRET,
      origin: process.env.WOW_API_REGION,
    });
    blizzardToken = response.data.access_token;

    await updateCharacter("odrel");

    runAllSims();
  } catch (e) {
    console.error(e);
  }
}

function initCrons() {
  // update all characters every hour with new data from battle.net
  cron.schedule(
    "0 * * * *",
    function () {
      console.log("CRON: Updating Characters");

      updateAllCharacters();
    },
    { timezone: process.env.TIMEZONE }
  );

  // start new droptimizer sims at 5:00am every day
  cron.schedule(
    "0 5 * * *",
    function () {
      console.log("CRON: Running character sims");

      runAllSims();
    },
    { timezone: process.env.TIMEZONE }
  );

  // update items at 4:00am every day
  cron.schedule(
    "0 4 * * *",
    function () {
      console.log("CRON: Updating items");

      updateItems();
    },
    { timezone: process.env.TIMEZONE }
  );
}

module.exports = {
  initData,
  initCrons,
  updateAllCharacters,
  updateCharacter,
  updateItems,
  updateSimReport,
  runAllSims,
  runSim,
};
