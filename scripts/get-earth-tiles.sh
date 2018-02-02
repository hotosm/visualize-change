#!/usr/bin/env bash

wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.planet.mbtiles.gz
gunzip latest.planet.mbtiles.gz

# docker/data/tiles is shared volume with api component
mkdir -p docker/data/tiles/
mv latest.planet.mbtiles docker/data/tiles/tiles.mbtiles
