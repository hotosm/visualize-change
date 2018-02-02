#!/bin/bash

wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.planet.mbtiles.gz
gunzip latest.planet.mbtiles.gz

# /data/tiles is shared volume with api component
mv planet.mbtiles /data/tiles/tiles.mbtiles

tippecanoe-decode tiles.mbtiles | tippecanoe -f -pf -pk -ps -b0 --no-tile-stats -l osm -Z0 -z12 -o tiles.processed.mbtiles

rm tiles.mbtiles
mv tiles.processed.mbtiles tiles.mbtiles

