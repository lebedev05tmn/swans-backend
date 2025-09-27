FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --ignore-scripts

COPY tsconfig.json ormconfig.js prebuild.cjs ./
COPY src ./src
COPY config ./config

RUN yarn build

EXPOSE 8081

CMD ["yarn", "start"]
