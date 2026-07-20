FROM node:22-alpine AS builder

RUN apk add --no-cache poppler-utils

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends poppler-utils && rm -rf /var/lib/apt/lists/*

# IQC 프로토타입용 Univer CLI (uexcli-rs가 glibc 전용 빌드라 Alpine/musl에서 fork/exec 실패)
RUN npm install -g univer-cli && univer doctor

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/main"]
