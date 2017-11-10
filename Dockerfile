FROM node:8.9.0

WORKDIR /probot-app-license

COPY package.json /probot-app-license/

RUN npm install
