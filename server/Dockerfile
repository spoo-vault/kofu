# Dockerfile for KOFU Protocol Server
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV DEMO_MODE=false
ENV STELLAR_NETWORK=testnet
ENV STELLAR_CONTRACT_ID=CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS
ENV STELLAR_ADMIN_PUBLIC_KEY=GBFOWEYQWBD6QSKBXMAXY2JFRDD7XAEZXHWFWXHQYK374M3YEWJYIQWQ

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
