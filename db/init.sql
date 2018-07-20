CREATE TABLE IF NOT EXISTS exports (
  id SERIAL,
  parent_id integer,
  config jsonb NOT NULL
);
