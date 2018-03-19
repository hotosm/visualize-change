#!/bin/bash

set -e

psql "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/postgres" <<-EOSQL
  CREATE TABLE IF NOT EXISTS exports (
    id SERIAL,
    parent_id integer,
    config jsonb NOT NULL
  );
EOSQL
