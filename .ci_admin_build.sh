#!/usr/bin/env bash
mkdir /build
export PATH=/opt/Sencha/Cmd:/usr/local/openjdk-8/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

cd ./admin

cp -R ./core /build/core
cp ./server.js /build/server.js
cp ./package.json /build/package.json
cp ./Dockerfile /build/Dockerfile
mkdir /build/project
cp -R ./project/conf /build/project/conf
mkdir /build/project/protected
cp ./project/config-prod.json /build/project/config.json
mkdir /build/tmp
find ./project/static/admin/crm/modules/ -regex '.*\(model\).*' -exec cp --parents {} /build/tmp \;
node jprepare.js /build/tmp client
cp -R /build/tmp/project/static/admin/crm/modules /build/project/protected
cp -R ./project/protected /build/project
rm -R /build/tmp
mkdir /build/project/static
mkdir /build/project/static/admin
cp -R ./project/static/admin/locale /build/project/static/admin
cp -R ./project/static/admin /build/project/static/tmp
mv /build/project/static/tmp/crm /build/project/static/tmp/app/crm
rm /build/project/static/tmp/app.js
mv /build/project/static/tmp/app_bld.js /build/project/static/tmp/app.js
node jprepare.js /build/project/static/tmp/app/crm/modules server
mkdir /build/project/static/admin/crm
cp -R /build/project/static/tmp/app/crm/modules /build/project/static/admin/crm
cd /build/project/static/tmp
sencha app build -pr
cd ../../../
rm -R ./project/static/tmp