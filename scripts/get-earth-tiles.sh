#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# docker/data/tiles is shared volume with api component
cd "$DIR"/../docker/data/tiles || exit 1

wget https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.planet.mbtiles.gz
gunzip latest.planet.mbtiles.gz

mv latest.planet.mbtiles docker/data/tiles/tiles.mbtiles
