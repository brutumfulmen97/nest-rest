FROM node:20-slim

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/* && \
  corepack enable && \
  corepack prepare pnpm@latest --activate && \
  npm install -g concurrently

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 3000
