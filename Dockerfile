# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and lock file first (for efficient caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files into the container
COPY . .

# Build the Astro project (Static Site Generation)
RUN npm run build

# Expose Astro's default static server port
EXPOSE 4321

# Serve the built files using Astro’s preview command
CMD ["npm", "run", "preview"]