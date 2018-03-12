#!/usr/bin/env bash

psql "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/postgres"
