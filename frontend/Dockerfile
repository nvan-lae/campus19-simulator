FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Vite default port is 5173
EXPOSE 5173

# Host 0.0.0.0 is required for Docker networking
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
