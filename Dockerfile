FROM node:22.17.1-slim

ARG VERSION
ENV VERSION=${VERSION}

WORKDIR /app
RUN apt-get update && apt-get install -y openssl libssl-dev \
  libglib2.0-0 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
  libgtk-3-0 libasound2 libxshmfence1 libgbm1 libatk1.0-0 libatk-bridge2.0-0 \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install -g pnpm
RUN pnpm install
RUN npx puppeteer browsers install chrome
COPY prisma ./prisma
RUN pnpm prisma generate
COPY . .
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

CMD ["/docker-entrypoint.sh"]
