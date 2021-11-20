FROM node:14-alpine

WORKDIR /home/netoviz
COPY . /home/netoviz/
RUN cp dot.env .env && npm rebuild && npm run build

EXPOSE 3000

CMD NODE_ENV=production ./bin/dbmigrate.sh && npm run start
