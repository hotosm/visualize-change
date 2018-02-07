#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ $# -eq 0 ]; then
  echo "Restart running container:"
  echo
  echo "  ./restart api"
  echo
  exit 0
fi

cd "$DIR"/.. || exit 1

docker-compose -f docker/docker-compose.dev.yml restart "$1"
