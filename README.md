# visualize-change

A toolkit to visualize changes in OSM, part of the OSM Analytics ecosystem. Work in Progress.

## structure

- `api` - api code (node + mongodb)
- `docker` - docker related files / configs
- `frontend` - frontend code
- `server` - ngnix config
- `scripts` - common scripts
- `renderer` - electron renderer
- `build.sh` - run after changing docker-related things, and on first pull
- `run.sh` - to start everything

## setup

1. `./scripts/get-indonesia-tiles.sh` (test tiles for `dev`)
2. `./build.sh`

## run

1. `./run.sh`
2. `open http://localhost:8080`

