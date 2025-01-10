# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Install required dependencies
RUN apk add --no-cache bash

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Copy the .env file to the container
COPY .env ./

# Compile TypeScript code
RUN npm run build

# Run Prisma migrations
RUN npx prisma migrate deploy

# Expose the port for the main server
EXPOSE 3001

# Use a process manager to handle multiple processes gracefully
RUN npm install -g pm2

# Start all the processes using PM2
CMD ["pm2-runtime", "start", "--name", "app", "dist/index.js", "--name", "market", "dist/MarketEventListener.js", "--name", "nft", "dist/NftEventListener.js"]
