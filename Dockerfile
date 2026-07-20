FROM node:22-alpine AS builder

RUN apk add --no-cache poppler-utils

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS production

RUN apk add --no-cache poppler-utils

# IQC 프로토타입용 Univer CLI (musl 호환 여부 미검증)
RUN npm install -g univer-cli && univer doctor

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/main"]
