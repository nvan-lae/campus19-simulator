# Base image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

COPY prisma ./prisma/

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run migrations (with retry while DB starts) and then start the app
CMD ["sh", "-c", "until npx prisma migrate deploy; do echo 'Waiting for database...'; sleep 3; done; npm run start:dev"]
