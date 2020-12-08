const request = require("request");
const blizzard = require("blizzard.js").initialize({
  key: process.env.WOW_API_CLIENTID,
  secret: process.env.WOW_API_CLIENTSECRET,
  origin: process.env.WOW_API_ORIGIN,
});

const { logger } = require("../logger");

let blizzardToken = "";

async function getToken() {
  if (blizzardToken) return blizzardToken;

  const response = await blizzard.getApplicationToken({
    key: process.env.WOW_API_CLIENTID,
    secret: process.env.WOW_API_CLIENTSECRET,
    origin: process.env.WOW_API_REGION,
  });
  blizzardToken = response.data.access_token;

  logger.info("[Blizzard] ", "Acquired new token");
  return blizzardToken;
}

async function getCharacterData(charName) {
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

        reject(error, response.statusCode)
      }
    );
  });
}

module.exports = {
  getCharacterData,
};
