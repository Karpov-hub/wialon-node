FROM mhart/alpine-node:16

WORKDIR /app

COPY wait-for /app/wait-for
COPY package.json /app/package.json
COPY lerna.json /app/lerna.json

COPY src /app/src

COPY packages /app/packages

COPY bots /app/bots

COPY preset_reports /app/preset_reports

COPY node_modules /app/node_modules

#RUN echo "Installing node modules" && \
#    sed -i '/postinstall/d' package.json && \
#    echo "CD APP" && cd /app && echo "INSTALL YARN" && yarn --ignore-scripts --no-optional && npx lerna bootstrap && echo "BUILD" && npx lerna run build

CMD ["npx", "lerna", "run", "dstart", "--parallel"]