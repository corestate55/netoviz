/**
 * Split alertHost for alert-host highlight.
 * @param {string} alertHost - Alert host to highlight.
 * @returns {AlertRow}
 * @protected
 */
export const splitAlertHost = alertHost => {
  const paths = String(alertHost).split('__')
  switch (paths.length) {
    case 2: // layer__host
      return { layer: paths[0], host: paths[1], tp: '' }
    case 3: // layer__host__tp
      return { layer: paths[0], host: paths[1], tp: paths[2] }
    default:
      return { layer: '', host: alertHost || '', tp: '' }
  }
}
