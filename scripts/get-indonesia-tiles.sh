#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# docker/data/tiles is shared volume with api component
cd "$DIR"/../docker/data/tiles || exit 1

rm indonesia.mbtiles.gz
wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country/indonesia.mbtiles.gz
gunzip indonesia.mbtiles.gz

mv indonesia.mbtiles tiles.mbtiles
