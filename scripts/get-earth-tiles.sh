#!/usr/bin/env bash

wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.planet.mbtiles.gz
gunzip latest.planet.mbtiles.gz
mkdir -p api/tiles/
mv latest.planet.mbtiles api/tiles/tiles.mbtiles
