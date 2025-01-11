FROM node:latest

WORKDIR /app

# Copy dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .
COPY .env ./

# Build and prepare the application
RUN npm run build
RUN npx prisma generate
RUN npx prisma migrate deploy

# Create a startup script
RUN echo '#!/bin/sh\n\
npx prisma generate\n\
node dist/index.js & \
node dist/MarketEventListener.js & \
node dist/NftEventListener.js & \
wait' > /app/start.sh

RUN chmod +x /app/start.sh
EXPOSE 3001

CMD ["/app/start.sh"]