# GrepCoin Next.js Production Dockerfile
# Optimized multi-stage build for GKE deployment

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy all necessary files for npm install (monorepo structure)
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/web/prisma ./apps/web/prisma/
COPY packages/anti-cheat/package.json ./packages/anti-cheat/
COPY packages/anti-cheat/src ./packages/anti-cheat/src/
COPY packages/anti-cheat/tsconfig.json ./packages/anti-cheat/

# Install all workspace dependencies and build anti-cheat package
RUN npm ci
RUN cd packages/anti-cheat && npm run build

# Generate Prisma client
WORKDIR /app/apps/web
RUN npx prisma generate

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy root node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy generated prisma client, built anti-cheat, and workspace-specific node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/packages/anti-cheat/dist ./packages/anti-cheat/dist
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
WORKDIR /app/apps/web
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl wget
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
