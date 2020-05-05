/**
 * Get gRPC-WEB API URI string.
 * @returns {string} - URI string.
 * @protected
 */
export const grpcURIBase = () => {
  const host = process.client
    ? window.location.hostname
    : process.env.NETOVIZ_GRPC_WEB_ADDR
  const port = process.env.NETOVIZ_GRPC_WEB_PORT
  return `http://${host}:${port}`
}

export const restURIBase = () => {
  const host = process.client
    ? window.location.hostname
    : process.env.NETOVIZ_REST_ADDR
  const port = process.env.NETOVIZ_REST_PORT
  return `http://${host}:${port}`
}
