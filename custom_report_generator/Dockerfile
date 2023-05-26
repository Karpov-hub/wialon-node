FROM mhart/alpine-node:16 As build
WORKDIR /app
COPY package.json /app/package.json
COPY src/index.js /app/src/index.js
COPY src/lib /app/src/lib
RUN npm i
CMD ["node", "src/index"]