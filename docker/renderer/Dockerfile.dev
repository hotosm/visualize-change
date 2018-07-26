FROM node:carbon-stretch

WORKDIR /app

RUN apt-get update
RUN apt-get install -y xvfb ffmpeg libgconf-2-4 libnss3 libgtk-3-0 libgtk-3-dev

RUN yarn global add wait-on

CMD wait-on -l tcp:rabbitmq:5672 && yarn install && yarn dev
