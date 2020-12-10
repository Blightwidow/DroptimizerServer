import sqlite3 from "sqlite3";
import { open } from "sqlite";

import logger  from "./logger.js";

const dbFilePath = "./data.db";
let db;

export async function openDb() {
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.cached.Database,
    });

    logger.info("[DB] ", "Connected to the database.");
    return db;
  } catch (error) {
    logger.error("[DB] ", error);
  }
}

export async function getDb() {
  if (db) {
    return db;
  }

  return openDb();
}

export async function initDatabase() {
  const db = await getDb();

  await db.run(`CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lastModified INTEGER NOT NULL,
            name TEXT UNIQUE NOT NULL,
            class INTEGER NOT NULL,
            thumbnail TEXT NOT NULL
        );`);

  await db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            quality INTEGER NOT NULL,
            itemLevel INTEGER NOT NULL
        );`);

  await db.run(`CREATE TABLE IF NOT EXISTS upgrades (
            characterID INTEGER NOT NULL,
            itemID INTEGER NOT NULL,
            reportID TEXT NOT NULL,
            dps FLOAT NOT NULL,
            baseDps FLOAT NOT NULL,
            spec TEXT NOT NULL,
            timeStamp INTEGER NOT NULL,
            CONSTRAINT fk_characterID FOREIGN KEY (characterID) REFERENCES characters(id) ON DELETE CASCADE,
            CONSTRAINT fk_itemID FOREIGN KEY (itemID) REFERENCES items(id) ON DELETE CASCADE
        );`);
}
