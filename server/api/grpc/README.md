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

Note to use `--unsafe-perm` for grpc-tools (`grpc_tools_node_protoc`) installation.
```
sudo npm install -g --unsafe-perm grpc-tools
```

For grpc-web, Download `protoc-gen-grpc-web` binary from
[grpc/grpc\-web](https://github.com/grpc/grpc-web/releases),
and put it under `PATH`.
```
sudo cp ~/Downloads/protoc-gen-grpc-web-1.0.7-linux-x86_64 /usr/local/bin/protoc-gen-grpc-web
sudo chmod +x /usr/local/bin/protoc-gen-grpc-web
```

## Compile

```
hagiwara@dev01:~/nwmodel/netoviz/server/graph-api/grpc$ grpc_tools_node_protoc \
  --js_out=import_style=commonjs,binary:. \
  --grpc-web_out=import_style=commonjs,mode=grpcwebtext:. \
  --grpc_out=. \
  topology-data.proto 
```

See: [package.json](/package.json), it can run with `npm run protoc`.

## Run test-server/client

Server (returns dummy data)
```
hagiwara@dev01:~/nwmodel/netoviz/$ node bin/grpc-server.js 
```

Client (CLI-client)
```
# PWD: ~/nwmodel/netoviz/

# Arguments: graph <graph_name> <json>
node bin/grpc-client.js graph force_simulation nlink_check.json

# Arguments: graph <number>
node bin/grpc-client.js alerts 3
```
