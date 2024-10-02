# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb /
RUN  bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

USER bun
EXPOSE 3000/tcp
CMD [ "bun", "run", "start" ]
