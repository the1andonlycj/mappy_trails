DROP TABLE IF EXISTS pointsmaps CASCADE;
CREATE TABLE pointsmaps (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  map_id INTEGER REFERENCES maps(id) ON DELETE CASCADE
);
