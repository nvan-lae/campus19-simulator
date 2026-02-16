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
RUN npx prisma generate

COPY backend .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
