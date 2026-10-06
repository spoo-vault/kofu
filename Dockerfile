# Multi-stage Dockerfile for KOFU Autonomous Economic Agreement Protocol Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and shared types
COPY package*.json ./
COPY shared ./shared
COPY server ./server

WORKDIR /app/server
RUN npm install
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=8080
ENV DEMO_MODE=false
ENV STELLAR_NETWORK=testnet
ENV STELLAR_CONTRACT_ID=CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS
ENV STELLAR_ADMIN_PUBLIC_KEY=GBFOWEYQWBD6QSKBXMAXY2JFRDD7XAEZXHWFWXHQYK374M3YEWJYIQWQ

COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/shared ../shared
RUN npm install --omit=dev

COPY --from=builder /app/server/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
