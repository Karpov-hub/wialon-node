FROM node:16-alpine

WORKDIR /app
COPY docs /app/docs
COPY packages /app/packages
COPY lerna.json /app/lerna.json
COPY package.json /app/package.json
COPY node_modules /app/node_modules
#RUN yarn --ignore-scripts --production 
#RUN npx lerna bootstrap
#RUN lerna run build --parallel

#FROM wialon-build
COPY src /app/src
COPY bots /app/bots
COPY preset_reports /app/preset_reports
COPY custom_report_generator /app/custom_report_generator
#RUN npx lerna bootstrap
#RUN lerna run build
#RUN mkdir -p /app/docs/public
RUN apk add --update docker openrc && mkdir /run/openrc && touch /run/openrc/softlevel