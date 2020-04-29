/**
 * @fileoverview gRPC-Web generated client stub for netoviz
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.netoviz = require('./topology-data_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.netoviz.TopologyDataClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.netoviz.TopologyDataPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.netoviz.GraphRequest,
 *   !proto.netoviz.GraphReply>}
 */
const methodDescriptor_TopologyData_GetGraphData = new grpc.web.MethodDescriptor(
  '/netoviz.TopologyData/GetGraphData',
  grpc.web.MethodType.UNARY,
  proto.netoviz.GraphRequest,
  proto.netoviz.GraphReply,
  /**
   * @param {!proto.netoviz.GraphRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.netoviz.GraphReply.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.netoviz.GraphRequest,
 *   !proto.netoviz.GraphReply>}
 */
const methodInfo_TopologyData_GetGraphData = new grpc.web.AbstractClientBase.MethodInfo(
  proto.netoviz.GraphReply,
  /**
   * @param {!proto.netoviz.GraphRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.netoviz.GraphReply.deserializeBinary
);


/**
 * @param {!proto.netoviz.GraphRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.netoviz.GraphReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.netoviz.GraphReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.netoviz.TopologyDataClient.prototype.getGraphData =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/netoviz.TopologyData/GetGraphData',
      request,
      metadata || {},
      methodDescriptor_TopologyData_GetGraphData,
      callback);
};


/**
 * @param {!proto.netoviz.GraphRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.netoviz.GraphReply>}
 *     A native promise that resolves to the response
 */
proto.netoviz.TopologyDataPromiseClient.prototype.getGraphData =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/netoviz.TopologyData/GetGraphData',
      request,
      metadata || {},
      methodDescriptor_TopologyData_GetGraphData);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.netoviz.AlertRequest,
 *   !proto.netoviz.AlertReply>}
 */
const methodDescriptor_TopologyData_GetAlerts = new grpc.web.MethodDescriptor(
  '/netoviz.TopologyData/GetAlerts',
  grpc.web.MethodType.UNARY,
  proto.netoviz.AlertRequest,
  proto.netoviz.AlertReply,
  /**
   * @param {!proto.netoviz.AlertRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.netoviz.AlertReply.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.netoviz.AlertRequest,
 *   !proto.netoviz.AlertReply>}
 */
const methodInfo_TopologyData_GetAlerts = new grpc.web.AbstractClientBase.MethodInfo(
  proto.netoviz.AlertReply,
  /**
   * @param {!proto.netoviz.AlertRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.netoviz.AlertReply.deserializeBinary
);


/**
 * @param {!proto.netoviz.AlertRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.netoviz.AlertReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.netoviz.AlertReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.netoviz.TopologyDataClient.prototype.getAlerts =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/netoviz.TopologyData/GetAlerts',
      request,
      metadata || {},
      methodDescriptor_TopologyData_GetAlerts,
      callback);
};


/**
 * @param {!proto.netoviz.AlertRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.netoviz.AlertReply>}
 *     A native promise that resolves to the response
 */
proto.netoviz.TopologyDataPromiseClient.prototype.getAlerts =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/netoviz.TopologyData/GetAlerts',
      request,
      metadata || {},
      methodDescriptor_TopologyData_GetAlerts);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.netoviz.ModelRequest,
 *   !proto.netoviz.ModelReply>}
 */
const methodDescriptor_TopologyData_GetModels = new grpc.web.MethodDescriptor(
  '/netoviz.TopologyData/GetModels',
  grpc.web.MethodType.UNARY,
  proto.netoviz.ModelRequest,
  proto.netoviz.ModelReply,
  /**
   * @param {!proto.netoviz.ModelRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.netoviz.ModelReply.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.netoviz.ModelRequest,
 *   !proto.netoviz.ModelReply>}
 */
const methodInfo_TopologyData_GetModels = new grpc.web.AbstractClientBase.MethodInfo(
  proto.netoviz.ModelReply,
  /**
   * @param {!proto.netoviz.ModelRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.netoviz.ModelReply.deserializeBinary
);


/**
 * @param {!proto.netoviz.ModelRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.netoviz.ModelReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.netoviz.ModelReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.netoviz.TopologyDataClient.prototype.getModels =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/netoviz.TopologyData/GetModels',
      request,
      metadata || {},
      methodDescriptor_TopologyData_GetModels,
      callback);
};


/**
 * @param {!proto.netoviz.ModelRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.netoviz.ModelReply>}
 *     A native promise that resolves to the response
 */
proto.netoviz.TopologyDataPromiseClient.prototype.getModels =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/netoviz.TopologyData/GetModels',
      request,
      metadata || {},
      methodDescriptor_TopologyData_GetModels);
};


module.exports = proto.netoviz;

