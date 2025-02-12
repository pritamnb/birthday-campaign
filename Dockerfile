FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose application port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
