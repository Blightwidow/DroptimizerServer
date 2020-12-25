import request from "request";

import logger from "../logger.js";

async function getToken() {
  const response = await new Promise((resolve, reject) => {
    request(
      {
        uri: `https://${process.env.WOW_API_REGION}.battle.net/oauth/token`,
        auth: {
          user: process.env.WOW_API_CLIENTID,
          pass: process.env.WOW_API_SECRET,
        },
        headers: {
          "User-Agent": `Node.js/${process.versions.node} Blizzard.js/3.2.0`,
        },
        qs: {
          grant_type: "client_credentials",
        },
      },
      (error, response, body) => {
        if (response && response.statusCode === 200) {
          let data = JSON.parse(body);
          resolve(data);
          return;
        }

        reject(error);
      }
    );
  });

  logger.info("[Blizzard] ", "Acquired new token");
  return response.access_token;
}

export async function getCharacterData(charName) {
  const token = await getToken();

  return new Promise((resolve, reject) => {
    request.get(
      `https://${
        process.env.WOW_API_REGION
      }.api.blizzard.com/profile/wow/character/${
        process.env.WOW_API_REALM
      }/${charName.toLowerCase()}?namespace=profile-${
        process.env.WOW_API_REGION
      }&locale=en_US&access_token=${token}`,
      function (error, response, body) {
        if (response && response.statusCode === 200) {
          let report = JSON.parse(body);
          return resolve(report);
        }

        reject(error, response.statusCode);
      }
    );
  });
}
