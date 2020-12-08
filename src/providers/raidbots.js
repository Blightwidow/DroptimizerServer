const request = require("request");
const puppeteer = require("puppeteer");

async function getAllItems() {
  return new Promise((resolve, reject) => {
    request.get(
      "https://www.raidbots.com/static/data/live/equippable-items.json",
      function (error, response, body) {
        if (response && response.statusCode === 200) {
          const data = JSON.parse(body);

          return resolve(data);
        }

        reject(error);
      }
    );
  });
}

async function getNewSimId(charName) {
  const uri = `https://www.raidbots.com/simbot/droptimizer?region=${process.env.WOW_API_REGION}&realm=${process.env.WOW_API_REALM}&name=${charName}`;
  const cookies = [
    {
      name: "raidsid",
      value: process.env.RAIDBOTS_COOKIE,
      domain: "www.raidbots.com",
    },
    {
      name: "__cfduid",
      value: process.env.RAIDBOTS_CFUID,
      domain: "www.raidbots.com",
    },
    {
      name: "__stripe_mid",
      value: process.env.RAIDBOTS_STRIPEID,
      domain: "www.raidbots.com",
    },
  ];

  const browser = await puppeteer.launch();
  if (browser) {
    const page = await browser.newPage();
    if (page) {
      await page.setCookie(...cookies);
      await page.goto(uri);
      // let raidbots have 3 secs to set up the page
      await new Promise((resolve) => setTimeout(() => resolve(), 1000 * 3));
      // select Raid
      const raidElement = await page.$(
        "#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2)"
      );
      await page.evaluate((element) => element.click(), raidElement);
      // select Tier
      const tierElement = await page.$(
        "#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div > div> div:nth-child(3)"
      );
      await page.evaluate((element) => element.click(), tierElement);
      // start the sim, twice bc it doesnt work otherwise
      await page.click(
        "#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(11) > div > div:nth-child(1) > button"
      );
      await page.waitForNavigation();
      const reportID = page.url().split("/")[5];
      await page.close();
      await browser.close();

      return reportID;
    }

    throw new Error("No browser page provided");
  }

  throw new Error("No browser found provided");
}

async function getSimReport(reportID) {
  return new Promise((resolve, reject) => {
    request.get(
      `https://www.raidbots.com/reports/${reportID}/data.json`,
      (error, response, body) => {
        if (response && response.statusCode === 200) {
          let data = JSON.parse(body);

          resolve(data);
          return;
        }

        reject();
      }
    );
  });
}

module.exports = {
  getAllItems,
  getNewSimId,
  getSimReport,
};
