FROM node:carbon-alpine

WORKDIR /app
RUN yarn global add wait-on

EXPOSE 4000

CMD wait-on -l tcp:db:5432 tcp:rabbitmq:5672 && yarn install && yarn dev
