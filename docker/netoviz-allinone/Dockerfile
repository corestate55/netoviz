FROM node:12.16.3-alpine3.11

WORKDIR /home
RUN apk update \
    && apk add git \
    && echo "# start repository cloning" \
    && git clone https://github.com/corestate55/netoviz.git \
    && echo "# end repository cloning, change directory" \
    && cd netoviz \
    && pwd \
    && cp dot.env .env \
    && ls -a \
    && echo "# start npm package install" \
    && npm install \
    && NODE_ENV=production ./bin/dbmigrate.sh \
    && echo "# start application building" \
    && npm run build

EXPOSE 3000

WORKDIR /home/netoviz
CMD npm run start
