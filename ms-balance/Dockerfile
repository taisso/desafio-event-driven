FROM node:18.12-alpine

WORKDIR /app

COPY . .

RUN yarn install && yarn build

USER node

CMD [ "yarn", "start" ]