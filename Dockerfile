FROM node:18
LABEL org.opencontainers.image.title="phpMyAdmin confd"
LABEL org.opencontainers.image.version="0.1.0"
LABEL org.opencontainers.image.authors="Pigo Chu <pigochu@gmail.com>"

WORKDIR /app
COPY ./ /app
ENV DOCKER_SOCKET_PATH=/var/run/docker.sock

CMD ["node","dist/index.js"]