/**
 * @file netoviz server definition
 */

import dotenv from 'dotenv'
import express from 'express'
import consola from 'consola'
import _nuxt from 'nuxt'
import grpc from 'grpc'

import config from '../nuxt.config.js'
import restApiRouter from './api/rest'
import grpcImplement from './api/grpc'
import services from './api/grpc/topology-data_grpc_pb'

dotenv.config()
const { Nuxt, Builder } = _nuxt

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'

// Init Nuxt.js
const nuxt = new Nuxt(config)
const host = nuxt.options.server.host
const httpPort = nuxt.options.server.port
const grpcPort = process.env.NETOVIZ_GRPC_LISTEN

/** HTTP server */
async function startHTTPServer() {
  const app = express()
  app.use('/api', restApiRouter) // set route for REST API

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(httpPort, host)
  consola.ready({
    message: `HTTP Server listening on http://${host}:${httpPort}/`,
    badge: true
  })
}

/** gRPC server */
function startGRPCServer() {
  const server = new grpc.Server()
  server.addService(services.TopologyDataService, grpcImplement)
  server.bind(`${host}:${grpcPort}`, grpc.ServerCredentials.createInsecure())
  server.start()
  consola.ready({
    message: `gRPC Server listening on http://${host}:${grpcPort}/`,
    badge: true
  })
}

// Run server.
console.log('[Server] NETOVIZ_API: ', process.env.NETOVIZ_API)
startHTTPServer()
if (process.env.NETOVIZ_API === 'grpc') {
  startGRPCServer()
}
