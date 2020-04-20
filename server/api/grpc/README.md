# gRPC memo

## Environment

```
hagiwara@dev01:~/nwmodel/netoviz$ uname -a
Linux dev01 5.3.0-46-generic #38-Ubuntu SMP Fri Mar 27 17:37:05 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
hagiwara@dev01:~/nwmodel/netoviz$ node --version
v10.15.2
hagiwara@dev01:~/nwmodel/netoviz$ npm --version
6.14.4
hagiwara@dev01:~/nwmodel/netoviz$ grpc_tools_node_protoc --version
libprotoc 3.6.1
hagiwara@dev01:~/nwmodel/netoviz$ 
```

## Tools

Note to use `--unsafe-perm`.
```
sudo npm install -g --unsafe-perm grpc-tools
```

## Compile

```
hagiwara@dev01:~/nwmodel/netoviz/server/graph-api/grpc$ grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=./ topology-data.proto 
hagiwara@dev01:~/nwmodel/netoviz/server/graph-api/grpc$
```

## Run test-server/client

Server
```
hagiwara@dev01:~/nwmodel/netoviz/$ node bin/grpc-server.js 
```

Client
```
hagiwara@dev01:~/nwmodel/netoviz/$ node bin/grpc-client.js
# start client
# send request:  hoge.json
# Receive response:
## Graph type:  forceSimulation
## Json name:  hoge.json
## Json data:  { "hoge": "test" }
hagiwara@dev01:~/nwmodel/netoviz/$ 
```
