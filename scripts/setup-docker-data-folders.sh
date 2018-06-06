#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.." || exit 1

cd docker/ || exit 1

mkdir -p data/capture data/db data/rabbitmq data/tiles > /dev/null

