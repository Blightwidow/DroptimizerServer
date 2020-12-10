--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE simc (
  id   INTEGER PRIMARY KEY,
  characterID INTEGER NOT NULL,
  text TEXT    NOT NULL,
  CONSTRAINT fk_characterID FOREIGN KEY (characterID) REFERENCES characters(id) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE simc;
