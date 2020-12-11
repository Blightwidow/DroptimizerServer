
FROM node:14-alpine AS builder
WORKDIR /app
RUN apk update && apk add python build-base
COPY ./ ./
RUN yarn install --production=true --pure-lockfile --network-timeout 600000

FROM node:14-alpine AS release
WORKDIR /app
COPY --from=builder /app/ .
CMD ["node", "/app/bin/www.js"]
