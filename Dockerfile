FROM node:lts-alpine AS builder
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

FROM node:lts-alpine AS final

# install wireguard packages
RUN apk add wireguard-tools-wg-quick

WORKDIR /app
COPY --from=builder ./app/build .
COPY package.json .
RUN npm install --omit=dev
CMD [ "node", "src/index.js" ]
EXPOSE 80