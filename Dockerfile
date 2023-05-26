FROM node:16-alpine As build

WORKDIR /app

COPY wait-for /app/wait-for
COPY package.json /app/package.json
COPY lerna.json /app/lerna.json

COPY src /app/src

COPY packages /app/packages

COPY node_modules /app/node_modules

RUN apk add --update git build-base 
# && \
#    echo "Installing node modules" && \
#    sed -i '/postinstall/d' package.json && \
#    yarn --ignore-scripts --production --no-optional && npx lerna bootstrap

CMD ["npx", "lerna", "run", "dstart", "--parallel"]