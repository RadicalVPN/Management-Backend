FROM oven/bun:latest

COPY . .

# install wireguard packages
RUN apk add wireguard-tools-wg-quick

RUN bun install --production
CMD [ "bun", "run", "src/index.ts" ]
EXPOSE 80