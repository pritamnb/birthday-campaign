FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package.json package-lock.json ./

# Install dependencies in a separate directory to prevent re-installation on code changes
RUN npm install --only=production

# Copy only necessary source files (avoiding node_modules from being overwritten)
COPY . . 

# Build the TypeScript application
RUN npm run build

# Remove dev dependencies and clear npm cache
RUN npm prune --production && npm cache clean --force

# Expose application port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]