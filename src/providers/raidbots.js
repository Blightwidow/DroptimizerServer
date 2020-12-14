import request from "request";
import puppeteer from "puppeteer";

import * as databaseProvider from "./database.js";

export async function getAllItems() {
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

export async function getNewSimId(charName) {
  const uri = `https://www.raidbots.com/simbot/droptimizer?region=${
    process.env.WOW_API_REGION
  }&realm=${process.env.WOW_API_REALM}&name=${charName.toLowerCase()}`;
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

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  if (browser) {
    const page = await browser.newPage();
    if (page) {
      await page.setCookie(...cookies);
      await page.goto(uri);

      // let raidbots have 3 secs to set up the page
      await page.waitFor("#SimcUserInput-input");
      const simc = await databaseProvider.getSimcByUserName(charName);

      if (simc) {
        await page.$eval(
          "#SimcUserInput-input",
          (el, value) => (el.value = value),
          simc.text
        );
        await new Promise((resolve) => setTimeout(() => resolve(), 1000 * 3));
      }

      // select Raid
      await page.$eval(
        "#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2)",
        (el) => el.click()
      );
      const tierMapping = {
        raidFinder: "div:nth-child(1)",
        normal: "div:nth-child(2)",
        heroic: "div:nth-child(3)",
        mythic: "div:nth-child(4)",
      };
      // select Tier
      await page.$eval(
        `#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div > div> ${
          tierMapping[process.env.RAIDBOT_TIER] || tierMapping.mythic
        }`,
        (el) => el.click()
      );
      // select Nightly
      await page.$eval(
        "#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(5) > div > label",
        (el) => el.click()
      );
      await page.select("#AdvancedSimOptions-simcVersion", "nightly");
      // start the sim
      await page.$eval(
        "#app > div > div.Container > section > section > div:nth-child(2) > section > div:nth-child(11) > div > div:nth-child(1) > button",
        (el) => el.click()
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

export async function getSimReport(reportID) {
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
