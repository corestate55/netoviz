FROM node:12.16.3-alpine3.11

# WORKDIR /home
# RUN apk update \
#     && apk add git \
#     && git clone https://github.com/corestate55/netoviz.git \
#     && cd netoviz \
#     && pwd \
#     && cp dot.env .env \
#     && npm install \
#     && NODE_ENV=production ./bin/dbmigrate.sh \
#     && npm run build

WORKDIR /home/netoviz
COPY . /home/netoviz/
RUN cp dot.env .env && npm rebuild && npm run build

EXPOSE 3000

CMD NODE_ENV=production ./bin/dbmigrate.sh && npm run start
