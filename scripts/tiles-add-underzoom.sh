#!/usr/bin/env bash

echo "This script adds 0-11 zoom levels to OSM QA Tiles that should already be downloaded in docker/data/tiles"
echo "For indonesia.mbtiles this takes about 1h on 2.2GHz i7 with 16GB of RAM and SSD"
echo

if ! type tippecanoe > /dev/null; then
  echo "ERR: tippecanoe has to be installed!"
  exit 1
fi

cd docker/data/tiles || exit 1

tippecanoe-decode tiles.mbtiles | tippecanoe -f -pf -pk -ps -b0 --no-tile-stats -l osm -Z0 -z12 -o tiles.processed.mbtiles

rm tiles.mbtiles
mv tiles.processed.mbtiles tiles.mbtiles
