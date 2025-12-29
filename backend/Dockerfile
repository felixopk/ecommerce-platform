# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# 🔥 REQUIRED for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:18-alpine

WORKDIR /app

# 🔥 REQUIRED for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
