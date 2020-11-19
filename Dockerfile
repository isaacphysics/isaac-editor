FROM node:15 AS build

WORKDIR /editor

COPY package.json /editor/package.json
RUN npm i

COPY scss /editor/scss
COPY app /editor/app

RUN npm run sass

FROM nginx:stable-alpine

COPY --from=build /editor/app /usr/share/nginx/html
COPY --from=build /editor/node_modules /usr/share/nginx/html/node_modules
COPY .git/refs/heads/master /usr/share/nginx/html/.git/refs/heads/master
