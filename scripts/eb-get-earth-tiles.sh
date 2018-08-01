#!/usr/bin/env bash

cd /efs/data/tiles || exit 1
rm latest.planet.mbtiles.gz
wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.planet.mbtiles.gz
gunzip latest.planet.mbtiles.gz
mv latest.planet.mbtiles tiles.mbtiles
