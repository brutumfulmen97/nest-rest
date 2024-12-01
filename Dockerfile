FROM node:20-slim

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g concurrently

RUN pnpm install

EXPOSE 3000
