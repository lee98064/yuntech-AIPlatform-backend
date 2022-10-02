FROM node:lts-alpine as build-stage
WORKDIR /app
ADD . /app
RUN npm install \
    && chmod +x ./exec.sh
EXPOSE 8080
CMD ./exec.sh