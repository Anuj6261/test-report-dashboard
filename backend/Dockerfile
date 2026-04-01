FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (layer caching — only reinstalls if package.json changes)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create data directory (will be populated by seed.js on startup) and assign ownership
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

USER appuser

EXPOSE 4000

CMD ["node", "server.js"]
