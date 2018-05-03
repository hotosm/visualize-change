FROM node:carbon-alpine

WORKDIR /app

COPY frontend .

# install deps for dev version
# this allows us to build the webpack prod version
RUN yarn install --dev

# info on ARG/ENV and build step: https://github.com/docker/compose/issues/1837
ARG MAPBOX_ACCESS_TOKEN
ARG MAP_VECTOR_SOURCE_MAXZOOM
ARG MAP_LAYER_MINZOOM
ARG NODE_ENV

ENV MAPBOX_ACCESS_TOKEN "$MAPBOX_ACCESS_TOKEN"
ENV MAP_VECTOR_SOURCE_MAXZOOM "$MAP_VECTOR_SOURCE_MAXZOOM"
ENV MAP_LAYER_MINZOOM "$MAP_LAYER_MINZOOM"
ENV NODE_ENV "$NODE_ENV"

RUN yarn build
RUN npm install -g forever

EXPOSE 3000

CMD forever server.js
