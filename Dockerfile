# Use official Astro image (or Node.js if preferred)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all project files
COPY . .

# Build Astro site
RUN npm run build

# Serve (for local testing)
CMD ["npx", "astro", "preview"]