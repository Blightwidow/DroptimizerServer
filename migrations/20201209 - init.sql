--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lastModified INTEGER NOT NULL,
    name TEXT UNIQUE NOT NULL,
    class INTEGER NOT NULL,
    thumbnail TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    quality INTEGER NOT NULL,
    itemLevel INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS upgrades (
    characterID INTEGER NOT NULL,
    itemID INTEGER NOT NULL,
    reportID TEXT NOT NULL,
    dps FLOAT NOT NULL,
    baseDps FLOAT NOT NULL,
    spec TEXT NOT NULL,
    timeStamp INTEGER NOT NULL,
    CONSTRAINT fk_characterID FOREIGN KEY (characterID) REFERENCES characters(id) ON DELETE CASCADE,
    CONSTRAINT fk_itemID FOREIGN KEY (itemID) REFERENCES items(id) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE upgrades;
DROP TABLE items;
DROP TABLE characters;
