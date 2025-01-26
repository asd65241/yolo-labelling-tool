# build environment
FROM node:20-slim

WORKDIR /app

COPY package.json ./

RUN yarn

COPY . ./

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
