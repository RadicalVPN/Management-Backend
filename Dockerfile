FROM oven/bun:debian

COPY . .

# install wireguard packages
RUN apt update
RUN apt install -y wireguard-tools

RUN bun install --production
CMD [ "bun", "run", "src/index.ts" ]
EXPOSE 80