FROM node:18-alpine

WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 3001

# Start the Node Express Server
CMD ["npm", "start"]
