# visualize-change

A toolkit to visualize changes in OSM, part of the OSM Analytics ecosystem. Work in Progress.

## structure

- `api` - api code (node + mongodb)
- `docker` - docker related files / configs
- `frontend` - frontend code
- `server` - `nginx` config (`nginx` binds frontend and api together and exposes port `8080` in dev)
- `scripts` - common scripts
- `renderer` - electron renderer
- `build.sh` - run after changing docker-related things, and on first pull
- `run.sh` - to start everything

## setup

1. `./scripts/get-indonesia-tiles.sh` (test tiles for `dev`, final application will use tiles for the whole earth)
2. `./build.sh`

## run

1. `./run.sh`
2. `open http://localhost:8080`

## dev workflow

Each app should crash on error, and will be picked up by `docker` and restarted. So crash errors while starting up are expected (for example when RabbitMQ or Mongo is still starting up).

On start each app first installs missing deps (`yarn install`), and then starts.

Frontend app doesn't exit on missing deps, but can be restarted by hand (to trigger deps update) using `./scripts/restart.sh frontend` (this should be solved at some point).

All parts of docker shadow `node_modules` folder to avoid native code problems (for example Electron installed on macOS wont run in docker).

## renderer notes

Exported `mp4` are stored in `./docker/data/capture` for now, mongodb (unused for now) data is stored in `./docker/data/db`. Both are docker shared volumes.

Export flow is as follows:

1. user selected date span, lat & lng coordinates, and provides email for notification when render is finished
2. render button triggers `/api/render` endpoint, which queues RabbitMQ message for renderer
3. renderer picks up the message, spawns headless electron, and renders frame by frame
4. after all frames are renderer, renderer spawns ffmpeg process to create mp4 file (files are stored in `./docker/data/capture`)
5. finally, server is notified back through RabitMQ, where email can be sent to the user

Renderer can be tested on host machine, so the Electron window is visible, to run: `yarn run test:local-render` providing proper rendering config as JSON, for example:

```sh
$ yarn run test:local-render '{ "lat": -8.343, "lng": 115.507, "startDate": "2017-09-01", "endDate": "2017-11-01"  }'
```

