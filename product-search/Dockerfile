FROM node:24 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.cjs ./
COPY src/products.json ./src/products.json
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]