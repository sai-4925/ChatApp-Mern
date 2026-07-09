FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Local upload fallback directory
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
