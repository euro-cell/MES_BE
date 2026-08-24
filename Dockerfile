FROM node:22-alpine AS builder

RUN apk add --no-cache poppler-utils

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends poppler-utils netcat-traditional && rm -rf /var/lib/apt/lists/*

# IQC 프로토타입용 Univer CLI (uexcli-rs가 glibc 전용 빌드라 Alpine/musl에서 fork/exec 실패)
# 버전을 고정하지 않으면 이미지 재빌드 시점의 latest가 캐시된 레이어에 그대로 굳어버려서,
# 로컬 CLI를 업그레이드해도 배포 이미지는 예전 버전에 머무는 버전 불일치가 생긴다.
RUN npm install -g univer-cli@0.4.4 && univer doctor

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/main"]
