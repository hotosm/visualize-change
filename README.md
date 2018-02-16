# visualize-change

A toolkit to visualize changes in OSM, part of the OSM Analytics ecosystem. Work in Progress.

## structure

- `api` - api code (node + mongodb)
- `docker` - docker related files / configs
- `frontend` - frontend code
- `server` - `nginx` config (`nginx` binds frontend and api together and exposes port `8080` in dev)
- `scripts` - common scripts
- `renderer` - electron renderer
- `tile-processor` - crontab and script that download and processes earth QA tiles daily, run only in production environment
- `build.dev.sh` - build docker dev version
- `run.dev.sh` - start docker dev version
- `build.prod.sh` - build docker production version
- `run.prod.sh` - start docker production version

## env

Some keys are required for app to work properly:

```
MAILGUN_API_KEY=...     # api key for mailgun
MAILGUN_DOMAIN=...      # domain from mailgun
MAPBOX_ACCESS_TOKEN=... # access token for mapbox
SERVER_DOMAIN=...       # main domain of the server (http://SERVER_DOMAIN/), used for making URL in email
```

For dev, this could be set in `PROJECT_ROOT/.env`, for production use it's preffered to `export` them in the shell.

## dev setup

1. `./scripts/get-indonesia-tiles.sh` (test tiles for `dev`, final application will use tiles for the whole earth)
2. optionally generated underzoom for tiles (this takes a while) `./scripts/tiles-add-underzoom.sh`
3. `./build.dev.sh`

## dev run

1. `./run.dev.sh`
2. `open http://localhost:8080`

## prod setup

1. `./scripts/get-indonesia-tiles.sh` (test tiles for now) OR `./scripts/get-earth-tiles.sh` (whole earth if you have the hard drive space)
2. optionally generated underzoom for tiles (this takes a while) `./scripts/tiles-add-underzoom.sh`
3. `./build.prod.sh`

## prod run

1. `./run.prod.sh`
2. `open http://localhost:8080`

## dev workflow

Each app should crash on error, and will be picked up by `docker` and restarted.

On start each app first installs missing deps (`yarn install`), and then starts.

All dockerized apps shadow `node_modules` folder to avoid native code problems (for example Electron installed on macOS wont run in docker).

All dockerized apps in dev mode run file watcher on `package.json` and re-install (`yarn install`) deps on changes to that file.

## offline renderer notes

Exported `mp4` are stored in `./docker/data/capture` for now, mongodb (unused for now) data is stored in `./docker/data/db`. Both are docker shared volumes.

Export flow is as follows:

1. user selected date span, lat & lng coordinates, and provides email for notification when render is finished
2. render button triggers `/api/render` endpoint, which queues RabbitMQ message for renderer
3. renderer picks up the message, spawns headless electron, and renders frame by frame
4. after all frames are renderer, renderer spawns ffmpeg process to create mp4 file (files are stored in `./docker/data/capture`)
5. finally, server is notified back through RabitMQ, where email can be sent to the user

Renderer can be tested on host machine, so the Electron window is visible, to run: `yarn run test:local-render` providing proper rendering config as JSON, for example:

```sh
$ yarn run test:local-render '$STRINGIFIED_RENDER_CONFIG'
```

Where `$STRINGIFIED_RENDER_CONFIG` should conform to api render config validation.

