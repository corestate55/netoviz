# Containerized netoviz

## Containers

2-layered application.

* [corestate55/netoviz\-web\-vue](https://github.com/corestate55/netoviz-web-vue)
  * Web Frontend (using Vue.js/Nuxt.js)
* [corestate55/netoviz\-web\-react](https://github.com/corestate55/netoviz-web-reqct)
  * Web Frontend (using React.js)
* [corestate55/netoviz\-app\-server](https://github.com/corestate55/netoviz-app-server)
  * Backend (topology data API and alert DB)

## Environment

See env files
* [env for web-vue](./web-vue-demo/dot.env)
* [env for web-react](./web-react-demo/dot.env)

```
                   (browser)
                     Web                 Web
                    Client              Server
                      |                   |
NETOVIZ_WEB_PORT      +------------------>* NETOVIZ_WEB_LISTEN
                      |                   |
                      |
                      |                 Proxy                      App
                      |                 Server                    Server
[REACT_APP_]          |                   |                         |
NETOVIZ_GRPC_WEB_PORT +------------------>* NETOVIZ_GRPC_WEB_LISTEN |
                      |                   |                         |
                      | NETOVIZ_GRPC_HOST |                         |
                      | NETOVIZ_GRPC_PORT +------------------------>* NETOVIZ_GRPC_LISTEN
[REACT_APP_]          |                                             |
NETOVIZ_REST_PORT     +-------------------------------------------->* NETOVIZ_REST_LISTEN
                      |                                             |
```

## Build containers

### Envoy proxy

See [envoy container directory](docker/envoy) and [docker-compose config](docker-compose.yml)

```
cd netoviz/docker/envoy
docker-compose build
```

### Web-server (Vue-based)

```
git clone https://github.com/corestate55/netoviz-web-vue.git
cd netoviz-web-vue
npm install
npm run docker-build
```
`npm run docker-build` exec `docker build` command.

### Web-server (React-based)

```
git clone https://github.com/corestate55/netoviz-web-react.git
cd netoviz-web-react
npm install
npm run docker-build
```
`npm run docker-build` exec `docker build` command.

### App-server

```
git clone https://github.com/corestate55/netoviz-app-server.git
cd netoviz-app-server
npm install
npm run docker-build
```
`npm run docker-build` exec `docker build` command.

## Run containers

See docker-compose.yml in each demo directory.
Run all containers.

```
cd netoviz/docker/web-vue-demo
cp dot.env .env
# edit .env if necessary.
docker-compose up
```

Next, access web-server `http://localhost:3000/`
