FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["sh", "-c", "npx drizzle-kit migrate && node dist/server.js"]
