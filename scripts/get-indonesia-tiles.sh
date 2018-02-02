#!/usr/bin/env bash

wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country/indonesia.mbtiles.gz
gunzip indonesia.mbtiles.gz

# docker/data/tiles is shared volume with api component
mkdir -p docker/data/tiles/
mv indonesia.mbtiles docker/data/tiles/tiles.mbtiles
