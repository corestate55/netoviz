# Containerized netoviz

## Containers

2-layered application.

* [corestate55/netoviz\-web\-server](https://github.com/corestate55/netoviz-web-server)
  * Web Frontend (using Vue.js)
* [corestate55/netoviz\-app\-server](https://github.com/corestate55/netoviz-app-server)
  * Backend (topology data API and alert DB)

## Environment

See [dot env file](./dot.env)
```
  Web                 Web       Envoy                   App
  Client              Server    Proxy                   Server
  (browser)
    |                   |        |                        |
    +------------------>|        |                        |
    | NETOVIZ_WEB_PORT  |        |                        |
    |                            |                        |
    +--------------------------->|                        |
    | NETOVIZ_GRPC_WEB_ADDR      +----------------------->| gRPC for
    | NETOVIZ_GRPC_WEB_PORT      | NETOVIZ_GRPC_ADDR      | developoment mode
    |                            | NETOVIZ_GRPC_PORT      |
    |                                                     |
    +---------------------------------------------------->| REST for
    | NETOVIZ_REST_ADDR                                     production mode
    | NETOVIZ_REST_PORT                                     (all-in-one case)
```

## Build containers

### Envoy proxy

See [envoy container directory](../envoy) and [docker-compose config](../../docker-compose.yml)

```
cd netoviz/docker/envoy
docker-compose build
```

### Web-server

```
git clone https://github.com/corestate55/netoviz-web-server.git
cd netoviz-web-server
npm install
npm run docker-build
```
`npm run docker-build` exec `docker build` command.
It need `npm install` before `npm run docker-build`,
because it copies local files to container image.

### App-server

```
git clone https://github.com/corestate55/netoviz-app-server.git
cd netoviz-app-server
npm install
npm run docker-build
```

Almost same as web-server.

## Run containers

See [docker-compose.yml](./docker-compose.yml).
Run all containers.

```
cd netoviz/docker/demo
cp dot.env .env
docker-compose up
```

Next, access web-server `http://localhost:3000/`

Currently, web/app server are build with development mode.
So these servers use gRPC (then they need envoy proxy).
