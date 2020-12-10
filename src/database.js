import sqlite3 from "sqlite3";
import { open } from "sqlite";

import logger from "./logger.js";

const dbFilePath = "./data.db";
let db;

export async function openDb() {
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.cached.Database
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

  await db.migrate();
}
