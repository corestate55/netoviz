<template>
  <div class="dummy"></div>
</template>

<script>
export default {
  computed: {
    apiParam() {
      /**
       * @typedef {Object} VisualizerAPIParam
       * @prop {string} use - API type to connect application server.
       * @prop {string} grpcURIBase - gRPC API URI.
       * @prop {string} restURIBase - REST API URI.
       */
      return {
        use: process.env.NETOVIZ_API || 'rest', // default: REST
        grpcURIBase: this.grpcURIBase,
        restURIBase: this.restURIBase
      }
    },
    grpcURIBase() {
      const host = window.location.hostname || process.env.NETOVIZ_GRPC_WEB_ADDR
      const port = process.env.NETOVIZ_GRPC_WEB_PORT
      return `http://${host}:${port}`
    },
    restURIBase() {
      const host = window.location.hostname || process.env.NETOVIZ_REST_ADDR
      const port = window.location.port || process.env.NETOVIZ_REST_PORT
      return `http://${host}:${port}`
    }
  }
}
</script>

<style></style>
