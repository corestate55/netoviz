# nwmodel-exercise

Exercise of Network Topology Model

## Write data by JSON and run check script

Generate bi-directional link data from unidirectional link-id string.
```
./link.sh VM1,eth0,HYP1-vSW1-BR-VL10,p3
```

Check data consistency
```
ruby model_checker.rb target.json
```

## JSON to XML

Create jtox file at first.
Notice: only use base topology model (NOT augmented model such as L2/L3).
```
pyang -f jtox -o topo.jtox ietf-network-topology@2018-02-26.yang ietf-network@2018-02-26.yang
```

Convert json to xml
```
json2xml topo.jtox target.json | xmllint --format - > target.xml
```

## Validate XML

OOPS...they are YANG/1.1
```
hagiwara@exp01:~/nwmodel/exercise$ yang2dsdl -t config ietf-network-topology@2018-02-26.yang ietf-network@2018-02-26.yang
DSDL plugin supports only YANG version 1.
hagiwara@exp01:~/nwmodel/exercise$ 
```

## Visualizer
Run HTTP Server, For example with ruby/WEBRick
```
$ ruby -rwebrick -e 'WEBrick::HTTPServer.new(:DocumentRoot => "./", :Port => 8000).start'
```
or with python.
```
$ python -m SimpleHTTPServer &
```

Access `http://localhost:8000/nwnode-vis.html` .
