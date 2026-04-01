FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (layer caching — only reinstalls if package.json changes)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Create data directory (will be populated by seed.js on startup)
RUN mkdir -p /app/data

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000

CMD ["node", "server.js"]
