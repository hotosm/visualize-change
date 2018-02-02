#!/bin/bash

wget -c https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.planet.mbtiles.gz
mv latest.planet.mbtiles.gz /data/tiles

# /data/tiles is shared volume with api component
cd /data/tiles || exit 1
gunzip latest.planet.mbtiles.gz
mv planet.tiles tmp.tiles

tippecanoe-decode tmp.mbtiles | tippecanoe -f -pf -pk -ps -b0 --no-tile-stats -l osm -Z0 -z12 -o tiles.processed.mbtiles

rm tiles.mbtiles
rm tmp.mbtiles
mv tiles.processed.mbtiles tiles.mbtiles

