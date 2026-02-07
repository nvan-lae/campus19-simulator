FROM node:22-alpine

WORKDIR /app

COPY shared ./shared
WORKDIR /app/shared
RUN npm install
RUN npm run build

WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma

RUN npm install

COPY backend .

EXPOSE 3000
CMD ["sh", "-c", "npx prisma generate && until npx prisma migrate deploy; do echo 'Waiting for database...'; sleep 3; done; npm run start:dev"]
