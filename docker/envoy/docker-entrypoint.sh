#!/usr/bin/env sh
set -e

CONF_DIR=/etc/envoy
CONF_FILE=envoy.yaml
/usr/bin/envsubst < ${CONF_DIR}/${CONF_FILE}.template > ${CONF_DIR}/${CONF_FILE}

# if the first argument look like a parameter (i.e. start with '-'), run Envoy
if [[ "${1#-}" != "$1" ]]; then
    set -- envoy "$@"
fi

if [[ "$1" = 'envoy' ]]; then
    # set the log level if the $loglevel variable is set
    if [[ -n "$loglevel" ]]; then
        set -- "$@" --log-level "$loglevel"
    fi
fi

exec "$@"
