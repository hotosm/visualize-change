FROM node:carbon-stretch

WORKDIR /app

COPY renderer .

RUN apt-get update
RUN apt-get install -y xvfb ffmpeg libgconf-2-4 libnss3 libgtk-3-0 libgtk-3-dev

# info on ARG/ENV and build step: https://github.com/docker/compose/issues/1837
ARG NODE_ENV
ENV NODE_ENV "$NODE_ENV"

RUN yarn global add wait-on
RUN yarn install

CMD wait-on -l tcp:rabbitmq:5672 && yarn start
