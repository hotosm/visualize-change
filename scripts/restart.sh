#!/usr/bin/env bash

if [ $# -eq 0 ]; then
  echo "Restart running container:"
  echo
  echo "  ./restart api"
  echo
  exit 0
fi

docker-compose -f docker/docker-compose.dev.yml restart "$1"
