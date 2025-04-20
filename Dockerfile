# Build image
FROM node:22-alpine AS build
ENV NODE_ENV='development'
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Actual server image
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
