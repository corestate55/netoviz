# Netoviz

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Netoviz (**Ne**twork **To**pology **Vis**ualizer) is a tool to visualize network topology data that based on
[RFC8345](https://datatracker.ietf.org/doc/rfc8345/).

See also [Netomox (Netwrok topology modeling toolbox)](https://github.com/corestate55/netomox), the tool to construct RFC8345 based network topology data.

## Demo

The visualizer works on Heroku.

* https://netoviz.herokuapp.com/

Demo movie

[![Batfish を使ってネットワーク構成を可視化してみよう \- YouTube](https://img.youtube.com/vi/YKKWg7Ap6H8/0.jpg)](https://www.youtube.com/watch?v=YKKWg7Ap6H8)

Blog
* [Batfish を使ってネットワーク構成を可視化してみよう \(1\) \- Qiita](https://qiita.com/corestate55/items/8a39af553785fd77c20a)
* [Batfish を使ってネットワーク構成を可視化してみよう \(2\) \- Qiita](https://qiita.com/corestate55/items/9d8023eb19637f9bbd1e)
* [Batfish を使ってネットワーク構成を可視化してみよう \(3\) \- Qiita](https://qiita.com/corestate55/items/10673ef74c33a24a0389)

Slide
* [「ネットワーク図」のモデル化とモデルを起点にした自動化の可能性 / onic2018 \- Speaker Deck](https://speakerdeck.com/corestate55/onic2018)
* [ここまでできる\! 設定ファイルからのネットワーク構成可視化 / npstudy17 \- Speaker Deck](https://speakerdeck.com/corestate55/npstudy17)

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

### Initialize database file
To highlight hosts in the dialog by event log,
SQLite3 database is used in this application.

For development mode (environment variable `NODE_ENV` is not `production`)

```bash
./bin/dbmigrate.sh
```

For production mode

```bash
NODE_ENV=production ./bin/dbmigrate.sh
```

To send a dummy log message (after running web server),
use test script like below.
It selects a name of hosts from specified model file and send random message to API server.
(NOTE: `push_alert.rb` calls `curl` utility.)

```bash
./bin/push_alert.rb ./public/model/target.json
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

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
