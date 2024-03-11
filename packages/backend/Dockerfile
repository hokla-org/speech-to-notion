FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install -g @nestjs/cli@10.3.2 && npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --only=production
CMD ["node", "dist/main"]
