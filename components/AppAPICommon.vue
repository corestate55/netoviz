<template>
  <div class="dummy"></div>
</template>

<script>
export default {
  computed: {
    apiParam() {
      return {
        use: this.$env.NETOVIZ_API,
        grpcURIBase: this.grpcURIBase,
        restURIBase: this.restURIBase
      }
    },
    grpcURIBase() {
      const protocol = window.location.protocol
      const host = window.location.hostname
      const port = this.$env.NETOVIZ_GRPC_WEB_PORT
      return `${protocol}//${host}:${port}`
    },
    restURIBase() {
      const protocol = window.location.protocol
      const host = window.location.hostname
      // If NETOVIZ_REST_PORT is defined,
      // use it instead of browser location port.
      // Run all-in-one application, unset NETOVIZ_REST_PORT.
      const port = this.$env.NETOVIZ_REST_PORT || window.location.port
      return `${protocol}//${host}:${port}`
    }
  }
}
</script>

<style></style>
