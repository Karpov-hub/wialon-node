# WIALON NODE

## Install on local host

Install Redis

```
sudo apt install redis
```

Install NATS MQ

```
sudo docker run --name=nats -d -p 4222:4222 -p 8222:8222 nats-streaming
```

Install Sencha CMD

```
https://www.sencha.com/products/extjs/cmd-download/
```

Install memcached

```
sudo apt-get install memcached
```

Clone mono repo

```
git clone git@gitlab.com:Alex_Gor/wialon-node.git
```

or

```
git clone https://gitlab.com/Alex_Gor/wialon-node.git
```

Install yarn

```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```

```
npm install -g verdaccio
verdaccio &

npm set registry http://localhost:4873/
npm adduser --registry http://localhost:4873
Username: test
Password: test
Email: test@test
```

Install node modules

```
cd wialon-node
yarn
npx lerna bootstrap
```

Install Imagemagick

```
sudo apt install imagemagick
```

Create directories

```
mkdir docs/json
mkdir upload
```

## Usage

Start/Stop nats

```
sudo docker start nats
sudo docker stop nats
```

Directory with microservices

```
src/
```

Run all microservices.
From the root directory

```
npx lerna run watch --parallel
```

Run all tests.
From the root directory

```
npm run test
```

Run unit tests

```
cd src/<service name>
npm run test
```

or

```
npx lerna run test --scope=<service name>
```

Skeleton of microservice

```
src/skeleton
```

Adding custom package

```
npx lerna create @lib/<package_name>
npx lerna add @lib/<package name> src/<service name>
```

and in the code:

```javascript
import module from "@lib/packageName";
```

## DB

### Adding a new model

```
npx sequelize-cli model:generate --name <model_name> --attributes id:uuid,lastName:string,email:string
```

then edit model and migration file

Run migration

```
cd packages/db
npx sequelize-cli db:migrate
```

### Adding a seed

```
npx sequelize-cli seed:generate --name demo-user
```

This command will create a seed file in seeders folder. File name will look something like XXXXXXXXXXXXXX-demo-user.js. It follows the same up / down semantics as the migration files.

Now we should edit this file to insert demo user to User table.

```javascript
"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          firstName: "John",
          lastName: "Doe",
          email: "demo@demo.com",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
```

Run seeds

```
npx sequelize-cli db:seed:all
```

### Adding docker image

In primary folder write follow command:

```
cd custom_report_generator
docker build -t customreport .
```
### How to enable docker remote API on docker host?

1. Navigate to /lib/systemd/system in your terminal and open docker.service file
   vi /lib/systemd/system/docker.service

1. Find the line which starts with ExecStart and adds -H=tcp://0.0.0.0:2375 to make it look like
   ExecStart=/usr/bin/dockerd -H=fd:// -H=tcp://0.0.0.0:2375

1. Save the Modified File

1. Reload the docker daemon
   systemctl daemon-reload

1. Restart the container
   sudo service docker restart

1. Test if it is working by using this command, if everything is fine below command should return a JSON
   curl http://localhost:2375/images/json

1. To test remotely, use the PC name or IP address of Docker Host
### Setup of the docker and server folder for reports
All reports should be stored in one specified folder.
That mean, what in the must be user with name 'user2' and folder of reports must have following path:
/home/user2/reports
```
Important remark - the part above applicable only for STAGING and PRODUCTION envieroment, not a local. For local no need create a need user and folder in the folder of this user
```
