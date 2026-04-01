FROM node:22-alpine AS builder

RUN apk add --no-cache poppler-utils

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS production

RUN apk add --no-cache poppler-utils

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/src/main"]
