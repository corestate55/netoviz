/**
 * @file HTTP Server of netoviz.
 */

const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const config = require('../nuxt.config.js')
const apiRouter = require('./api')

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'

/**
 * Run HTTP server.
 */
async function start() {
  // set api route
  app.use('/api', apiRouter)

  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

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
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
