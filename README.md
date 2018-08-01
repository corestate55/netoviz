# nwmodel-exercise

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Exercise of Network Topology Model ([RFC 8345 \- A YANG Data Model for Network Topologies](https://datatracker.ietf.org/doc/rfc8345/))

## Directory

* `src`: Source code files of visualizer.
  * Codes are packed by `webpack` and stored in `dist` as `main.js`.
* `dist`: Distributed files. (`devServer`'s document-root)
* `dist/model`: Topology data files and helper scripts.

## YANG Files

You can find latest yang files defined in [RFC8345](https://www.rfc-editor.org/info/rfc8345
) and [RFC8346](https://www.rfc-editor.org/info/rfc8346) at [Yang models repository on github](https://github.com/YangModels/yang/tree/master/standard/ietf/RFC).
Draft [L2 network topology](https://datatracker.ietf.org/doc/draft-ietf-i2rs-yang-l2-network-topology/) yang file is also at [experimental folder in the repository](https://github.com/YangModels/yang/tree/master/experimental/ietf-extracted-YANG-modules)

## Handling Network Topology Data Instance

### Setup tools

Install [pyang](https://github.com/mbj4668/pyang) and JSON/XML utility as you like.

### Write data by JSON and run check script

Generate bi-directional link data from unidirectional link-id string.
```
./link.sh VM1,eth0,HYP1-vSW1-BR-VL10,p3
```

Check data consistency
```
ruby nwmodel-checker.rb target.json
```

### Validate JSON

Install pyang JSON Schema plugin from [EAGLE\-Open\-Model\-Profile\-and\-Tools/YangJsonTools at ToolChain](https://github.com/OpenNetworkingFoundation/EAGLE-Open-Model-Profile-and-Tools/tree/ToolChain/YangJsonTools) instead of [cmoberg/pyang\-json\-schema\-plugin](https://github.com/cmoberg/pyang-json-schema-plugin). (because cmoberg's plugin [can work only on single yang module at a time](https://github.com/cmoberg/pyang-json-schema-plugin/issues/4))

Generate json schema
```
pyang -f json_schema -o topo.jsonschema ietf-network@2018-02-26.yang ietf-network-topology@2018-02-26.yang
```
and validate (using [jsonlint](https://www.npmjs.com/package/jsonlint-cli) or other json tool).
```
jsonlint-cli -s topo.jsonschema target.json
```

### JSON to XML

Create jtox file at first.
Notice: only use base topology model (NOT augmented model such as L2/L3).
```
pyang -f jtox -o topo.jtox ietf-network-topology@2018-02-26.yang ietf-network@2018-02-26.yang
```

Convert json to xml
```
json2xml topo.jtox target.json | xmllint --format - > target.xml
```

### Validate XML

OOPS...they are YANG/1.1
```
$ yang2dsdl -t config ietf-network-topology@2018-02-26.yang ietf-network@2018-02-26.yang
DSDL plugin supports only YANG version 1.
```

## Visualizer

This visualizer depends on [D3.js v4](https://d3js.org/), [Webpack](https://webpack.js.org/), [Node.js](https://nodejs.org/ja/) and [NPM](https://www.npmjs.com/).

### Demo

The visualizer works on Heroku.

* https://nwmodel-vis.herokuapp.com/

### Install

Install Node.js and NPM at first in your system.

Install packages used by this visualizer (according to `package.json`).
```
npm install
```

### Run web server
Run `webpack-dev-server`.
```
npm run start
```
Then, it opens dist/index.html with browser.

### Build

Run `webpack`
```
npm run build
```

### Lint

Run `eslint`.
```
npm run lint
```

## Structure

```
 augmented topology data model        topology data structure       graph object structure        visualizer
 (RFC8346,                            (RFC8345)
 draft-ietf-i2rs-yang-l2-network-topology)
                                        +-----------+                   +-----------+            +-----------+
              +-------------------------| networks  |-------------------|  graphs   |<|----------|visualizer |
              |                         +-----+-----+                   +-----+-----+ whole      +-----+-----+
        +-----+-----+                         |                               |       layerrs          |
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
