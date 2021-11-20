// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var server_api_grpc_topology$data_pb = require('../../../server/api/grpc/topology-data_pb.js');

function serialize_netoviz_GraphReply(arg) {
  if (!(arg instanceof server_api_grpc_topology$data_pb.GraphReply)) {
    throw new Error('Expected argument of type netoviz.GraphReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_netoviz_GraphReply(buffer_arg) {
  return server_api_grpc_topology$data_pb.GraphReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_netoviz_GraphRequest(arg) {
  if (!(arg instanceof server_api_grpc_topology$data_pb.GraphRequest)) {
    throw new Error('Expected argument of type netoviz.GraphRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_netoviz_GraphRequest(buffer_arg) {
  return server_api_grpc_topology$data_pb.GraphRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_netoviz_ModelReply(arg) {
  if (!(arg instanceof server_api_grpc_topology$data_pb.ModelReply)) {
    throw new Error('Expected argument of type netoviz.ModelReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_netoviz_ModelReply(buffer_arg) {
  return server_api_grpc_topology$data_pb.ModelReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_netoviz_ModelRequest(arg) {
  if (!(arg instanceof server_api_grpc_topology$data_pb.ModelRequest)) {
    throw new Error('Expected argument of type netoviz.ModelRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_netoviz_ModelRequest(buffer_arg) {
  return server_api_grpc_topology$data_pb.ModelRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var TopologyDataService = exports.TopologyDataService = {
  getGraphData: {
    path: '/netoviz.TopologyData/GetGraphData',
    requestStream: false,
    responseStream: false,
    requestType: server_api_grpc_topology$data_pb.GraphRequest,
    responseType: server_api_grpc_topology$data_pb.GraphReply,
    requestSerialize: serialize_netoviz_GraphRequest,
    requestDeserialize: deserialize_netoviz_GraphRequest,
    responseSerialize: serialize_netoviz_GraphReply,
    responseDeserialize: deserialize_netoviz_GraphReply,
  },
  getModels: {
    path: '/netoviz.TopologyData/GetModels',
    requestStream: false,
    responseStream: false,
    requestType: server_api_grpc_topology$data_pb.ModelRequest,
    responseType: server_api_grpc_topology$data_pb.ModelReply,
    requestSerialize: serialize_netoviz_ModelRequest,
    requestDeserialize: deserialize_netoviz_ModelRequest,
    responseSerialize: serialize_netoviz_ModelReply,
    responseDeserialize: deserialize_netoviz_ModelReply,
  },
};

exports.TopologyDataClient = grpc.makeGenericClientConstructor(TopologyDataService);
