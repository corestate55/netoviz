# nwmodel-exercise

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Exercise of Network Topology Model ( ref. [RFC 8345 \- A YANG Data Model for Network Topologies](https://datatracker.ietf.org/doc/rfc8345/))

## Directory

* `src`: Source code files of visualizer.
  * Codes are packed by `webpack` and stored in `dist` as `main.js`.
* `dist`: Distributed files. (`devServer`'s document-root)
* `dist/model`: Topology data files and helper scripts.

## YANG Files

You can find latest yang files defined in RFC8345 at [Yang models repository on github](https://github.com/YangModels/yang/tree/master/standard/ietf/RFC).

## Handling Network Topology Data Instance

### Write data by JSON and run check script

Generate bi-directional link data from unidirectional link-id string.
```
./link.sh VM1,eth0,HYP1-vSW1-BR-VL10,p3
```

Check data consistency
```
ruby nwmodel-checker.rb target.json
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
