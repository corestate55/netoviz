<template>
  <div class="dummy"></div>
</template>

<script>
export default {
  computed: {
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
