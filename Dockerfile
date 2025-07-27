FROM node:22.17.1-slim

ARG VERSION
ENV VERSION=${VERSION}

WORKDIR /app
RUN apt-get update && apt-get install -y openssl libssl-dev
COPY package.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY prisma ./prisma
RUN pnpm prisma generate
COPY . .
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

CMD ["/docker-entrypoint.sh"]
