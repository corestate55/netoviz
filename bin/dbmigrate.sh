#!/bin/sh

CWD=`pwd`
SEQUELIZE="node_modules/.bin/sequelize"
SRV_DIR="srv"
CONFIG="${SRV_DIR}/config/config.json"

sed -i -e "s/${SRV_DIR}\///g" ${CONFIG}
cd ${SRV_DIR}
${CWD}/${SEQUELIZE} db:migrate --env development
cd ${CWD}
git checkout ${CONFIG}
