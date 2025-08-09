FROM node:22.17.1-slim

WORKDIR /app
RUN apt-get update && apt-get install -y openssl libssl-dev \
  libglib2.0-0 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
  libgtk-3-0 libasound2 libxshmfence1 libgbm1 libatk1.0-0 libatk-bridge2.0-0 \
  fonts-liberation \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# install deps for workspaces
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspaces

# build shared so it exists at runtime
COPY packages/shared ./packages/shared
RUN npm run -w @siikli/shared build

# copy backend sources and generate prisma client in backend workspace
COPY backend ./backend
RUN npm run -w backend prisma:generate

# (optional) only if you truly need Chrome in the image
# RUN npx puppeteer browsers install chrome

# entrypoint & start
COPY backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
WORKDIR /app/backend
EXPOSE 3000

ARG VERSION
ENV VERSION=${VERSION}

CMD ["/docker-entrypoint.sh"]
