FROM node:18-alpine

# Instalar o cliente PostgreSQL
RUN apk add --no-cache postgresql-client

# Use existing node user (uid=1000, gid=1000)
WORKDIR /app

# Copy package files and install dependencies as root
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create dist directory and set permissions for node user
RUN mkdir -p dist && \
    chown -R node:node /app

# Switch to node user
USER node

EXPOSE 3000

CMD ["npm", "start"]