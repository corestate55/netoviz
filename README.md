# Netoviz

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Netoviz (**Ne**twork **To**pology **Vis**ualizer) is a tool to visualize network topology data that based on
[RFC8345](https://datatracker.ietf.org/doc/rfc8345/).

See also [Netomox (Netwrok topology modeling toolbox)](https://github.com/corestate55/netomox), the tool to construct RFC8345 based network topology data.

## Demo

The visualizer works on Heroku.

* https://netoviz.herokuapp.com/

## Directory

* `src`: Source code files of visualizer.
* `public`: Distributed files.
  * `public/model`: Topology data files (json)
* `srv`: Server (API)

## Installation
### Environment setup
This application depends on:
* [Node.js](https://nodejs.org/ja/) (v8.10 or later)
* [NPM](https://www.npmjs.com/) (v6.6 or later)

### Project setup
This application depends on:
* [D3.js v4](https://d3js.org/)
* [Vue-CLI v3](https://cli.vuejs.org/)

```
npm install
```

## Run web server
### for development
Run API server for development (using [vue-cli-plugin-express](https://www.npmjs.com/package/vue-cli-plugin-express))
```
npm run express
```
and application (Compiles and hot-reloads for development).
```
npm run serve
```

### for production
Build (compile and minify) script for production,
```
npm run build
```
and run API/application server.
```
npm run express:run
```

## Lints and fixes files
```
npm run lint
```

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Structure

```
 augmented topology data model        topology data structure       graph object structure        visualizer
 (RFC8346,                            (RFC8345)
 draft-ietf-i2rs-yang-l2-network-topology)                                               object
                                        +-----------+                   +-----------+    data    +-----------+
              +-------------------------| networks  |-------------------|  graphs   | =========> |visualizer |
              |                         +-----+-----+                   +-----+-----+ whole      +-----+-----+
        +-----+-----+                         |                               |       layers           |
        |   L2/L3   |                   +-----+-----+                   +-----+-----+            +-----+-----+
        |  network  |-----------------|>| network   |                   |  graph    | single     |operational|
        +-----+-----+                   +-----+-----+                   +-----+-----+ layer      |visualizer | event
              |                               |                               |                  +-----+-----+ handling
      +-------+-------+               +-------+-------+               +-------+-------+                |
      |               |               |               |               |               |                V
      |         +-----+-----+         |               |               |    node +-----+-----+    +-----+-----+
      |         |   L2/L3   |         |         +-----+-----+         |  object |  graph    |    |simulated  |
      |         |   node    |---------(-------|>|   node    | . . . . ( . . . . |   node    |    |visualizer | force
      |         +-----+-----+         |         +-----+-----+         |         +-----------+    +-----+-----+ simulation
+-----+-----+         |               |               |   tp-tp +-----+-----+         : tp             |
|   L2/L3   |         |         +-----+-----+         |    link |  graph    |         : object         V
|   link    |---------(-------|>|   link    | . . . . (. . . . .|   link    |         :          +-----+-----+
+-----------+         |         +-----------+         |         +-----------+         :          |single     |
                      |                               |               : tp-node       :          |visualizer | static
                +-----+-----+                         |               : link          :          +-----------+ graph
                |   L2/L3   |                   +-----+-----+         :               :                        object
                | term pts  |-----------------|>| term pts  | . . . . : . . . . . . . :
                +-----------+                   +-----------+
```

See more detail, [class diagram in fig directory](./fig/).
