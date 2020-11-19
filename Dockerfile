FROM node:15 AS build

WORKDIR /editor

COPY package.json /editor/package.json
RUN npm i

COPY scss /editor/scss
COPY app /editor/app

RUN npm run sass

FROM nginx:stable-alpine

COPY --from=build /editor /usr/share/nginx/html
COPY .git/refs/heads/master /usr/share/nginx/html/.git/refs/heads/master
