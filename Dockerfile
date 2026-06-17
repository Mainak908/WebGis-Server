# --- Build Stage ---
FROM oven/bun:1-alpine AS builder

WORKDIR /usr/src/app

# Copy package definition and lockfile
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies needed for build)
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Generate Prisma Client (outputs to src/generated/prisma)
RUN bunx prisma generate

# Build the NestJS application
RUN bun run build

# --- Production Stage ---
FROM oven/bun:1-alpine AS runner

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy package definition
COPY --from=builder /usr/src/app/package.json ./

# Copy compiled code, generated Prisma Client, and node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/generated ./src/generated
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Cloud Run sets the PORT environment variable at runtime.
# The NestJS application is configured to listen on process.env.PORT.
EXPOSE 4000

# Start the application using Bun
CMD ["bun", "dist/src/main.js"]
