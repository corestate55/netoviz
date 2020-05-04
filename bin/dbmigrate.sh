#!/bin/sh

CWD=$(pwd)
SEQUELIZE="node_modules/.bin/sequelize"
DB_DIR="db"
CONFIG="${DB_DIR}/config/config.json"

MODE="development"
mkdir -p ${DB_DIR}/storage
if test ! -z ${NODE_ENV}; then
  MODE=${NODE_ENV}
fi

# delete DB_DIR (server directory) from config when migration
sed -i -e "s/${DB_DIR}\///g" ${CONFIG}
cd "${DB_DIR}" || exit
"${CWD}/${SEQUELIZE}" db:migrate --env "$MODE"
cd "$CWD" || exit
sed -i -e "s/\([a-zA-Z0-9\/]*.sqlite3\)/${DB_DIR}\/\1/g" ${CONFIG}
