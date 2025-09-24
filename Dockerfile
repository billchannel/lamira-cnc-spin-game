FROM node:18-alpine

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Run linting
RUN npm run lint

# Clean up dev dependencies
RUN npm prune --production

# Install serve globally
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S -D -H -u 1001 -s /sbin/nologin appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

CMD ["serve", "-s", ".", "-l", "8080"]