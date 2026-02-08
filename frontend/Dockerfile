FROM node:22-alpine

WORKDIR /app

COPY shared ./shared
WORKDIR /app/shared
RUN npm install
RUN npm run build

WORKDIR /app/frontend
COPY frontend/package*.json ./

RUN npm install

COPY frontend .

EXPOSE 5173

# Host 0.0.0.0 is required for Docker networking
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
