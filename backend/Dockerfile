# Build stage
FROM node:18-alpine AS build

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the app
RUN pnpm build

# Production stage
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile
# Copy Prisma schema
COPY prisma ./prisma


# Copy built app from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Generate Prisma client with custom output path
RUN pnpm exec prisma generate 

# Command to run the app
CMD ["node", "dist/server.js"]