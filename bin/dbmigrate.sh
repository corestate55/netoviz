#!/bin/sh

CWD=$(pwd)
SEQUELIZE="node_modules/.bin/sequelize"
SRV_DIR="srv"
CONFIG="$SRV_DIR/config/config.json"

MODE="development"
if test ! -z "$NODE_ENV"; then
  MODE="$NODE_ENV"
fi

# delete SRV_DIR (server directory) from config when migration
sed -i -e "s/$SRV_DIR\///g" ${CONFIG}
cd "$SRV_DIR" || exit
"$CWD/$SEQUELIZE" db:migrate --env "$MODE"
cd "$CWD" || exit
sed -i -e "s/\([a-zA-Z0-9]*.sqlite3\)/${SRV_DIR}\/\1/g" ${CONFIG}
