import express from "express";
import createHttpError from "http-errors";
const router = express.Router();

import logger from "../../logger.js";
import * as databaseProvider from "../../providers/database.js";

const BOSSES = [
  {
    id: 1,
    name: "Shriekwing",
    loot: [183034, 182976, 183027, 182979, 184016],
  },
  {
    id: 2,
    name: "Huntsman Altimor",
    loot: [183040, 182988, 182996, 183018, 182995, 184017],
  },
  {
    id: 3,
    name: "Sun King Salvation",
    loot: [183033, 182986, 182977, 183007, 183025, 184019, 184018, 184020],
  },
  {
    id: 4,
    name: "Artificer Xymox",
    loot: [182987, 183019, 183004, 183012, 183038, 184021],
  },
  {
    id: 5,
    name: "Hungering Destroyer",
    loot: [
      183001,
      182994,
      183000,
      183009,
      183028,
      182992,
      183024,
      184022,
      184023,
    ],
  },
  {
    id: 6,
    name: "Lady Inerva Darkvein",
    loot: [183021, 183026, 183015, 182985, 183037, 184025],
  },
  {
    id: 7,
    name: "The Council of Blood",
    loot: [183039, 182989, 183014, 183011, 183030, 183023, 182983, 184024],
  },
  {
    id: 8,
    name: "Sludgefist",
    loot: [182999, 182984, 183022, 183005, 183016, 182981, 183006, 184026],
  },
  {
    id: 9,
    name: "Stone Legion Generals",
    loot: [183029, 183032, 182998, 182991, 183002, 184027],
  },
  {
    id: 10,
    name: "Sire Denathrius",
    loot: [
      182997,
      182980,
      183003,
      183020,
      183036,
      184024,
      184030,
      184029,
      184031,
    ],
  },
];

// gets all bosses
router.get("/$", async function (req, res) {
  try {
    res.json(BOSSES.map(({ loot, ...rest }) => rest));
  } catch (error) {
    logger.error("[Boss] ", `Error getting all bosses`, error);
    throw error;
  }
});

// gets a boss by name
router.get("/:id", async function (req, res) {
  try {
    const boss = BOSSES.find((boss) => boss.id === req.params.id);

    if (!boss) {
      throw createHttpError.NotFound();
    }

    const { loot, ...rest } = boss;
    res.json(rest);
  } catch (error) {
    logger.error("[Boss] ", `Error getting boss`, error);
    throw error;
  }
});

router.get("/:id/items", async function (req, res) {
  try {
    const boss = BOSSES.find((boss) => boss.id == req.params.id);

    if (!boss) {
      throw createHttpError.NotFound();
    }

    const items = await databaseProvider.getItemsByIds(boss.loot);

    res.json(items);
  } catch (error) {
    logger.error("[Boss] ", `Error getting boss `, error);
    throw error;
  }
});

export default router;
