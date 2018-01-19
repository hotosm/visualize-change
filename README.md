# dockerized-webapp-template

Based on https://blog.bam.tech/developper-news/dockerize-your-app-and-keep-hot-reloading

## structure

- `api` - api code (node + mongodb)
- `docker` - docker related files / configs
- `frontend` - frontend code
- `server` - ngnix config
- `scripts` - common scripts
- `build.sh` - run after changing docker-related things, and on first pull
- `run.sh` - to start everything

## setup

`./build.sh`

## run

1. `./run.sh`
2. `open http://localhost:8080`

