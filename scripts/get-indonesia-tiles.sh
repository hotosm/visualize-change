#!/usr/bin/env bash

wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country/indonesia.mbtiles.gz
gunzip *.gz
mkdir -p api/tiles/
mv indonesia.mbtiles api/tiles/tiles.mbtiles
