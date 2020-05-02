/**
 * Get gRPC-WEB API URI string.
 * @returns {string} - URI string.
 * @protected
 */
export const grpcURIBase = () => {
  const host = process.env.NETOVIZ_GRPC_WEB_ADDR || window.location.hostname
  const port = process.env.NETOVIZ_GRPC_WEB_PORT
  return `http://${host}:${port}`
}

export const restURIBase = () => {
  const host = process.env.NETOVIZ_REST_ADDR || window.location.hostname
  const port = process.env.NETOVIZ_REST_PORT
  return `http://${host}:${port}`
}
