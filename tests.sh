#!/bin/bash
export NODE_ENV="test"
cd ./src/skeleton && npm test && npm start &
cd ../gate-service && npm test
cd ../../