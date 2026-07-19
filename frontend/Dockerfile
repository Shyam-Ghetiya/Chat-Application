FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies for serving
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the application
CMD ["serve", "-s", "dist", "-l", "5173"]
