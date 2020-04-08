/**
 * @file Definition of link for distance graph.
 */

import ForceSimulationLink from '../force-simulation/link'

/**
 * @typedef {DistanceLink} DistanceLinkData
 */
/**
 * Link of distance graph.
 * @extends {ForceSimulationLink}
 */
class DistanceLink extends ForceSimulationLink {
  constructor(linkData) {
    super(linkData)

    // end node info
    /** @type {string} */
    this.sourceNodePath = this._endNodePath(this.sourcePath)
    /** @type {string} */
    this.targetNodePath = this._endNodePath(this.targetPath)
  }

  /**
   * Pick layer name from path.
   * @returns {string} - Layer name.
   * @public
   */
  layerPath() {
    return this.path.split('__').shift()
  }

  /**
   * Check link type is tp-tp or not.
   * @returns {boolean} True if tp-tp type link.
   * @public
   */
  isTypeTpTp() {
    return this.type === 'tp-tp'
  }

  /**
   * Check link is in specified layer (network).
   * @param {string} layer - Layer name.
   * @returns {boolean} True if link in the layer.
   * @public
   */
  isInLayer(layer) {
    return this.layerPath() === layer
  }

  /**
   * Check is this link connects specified node.
   * @param {string} nodePath - Path of node.
   * @returns {boolean} True if this link has term-point in the node.
   * @public
   */
  isConnectingNode(nodePath) {
    return this.sourceNodePath === nodePath || this.targetNodePath === nodePath
  }

  /**
   * Pick node path which has specified link end (source/target term-point).
   * @param {string} linkEndPath - Path of link end term-point.
   * @returns {string} Node path.
   * @private
   */
  _endNodePath(linkEndPath) {
    return linkEndPath
      .split('__')
      .slice(0, 2)
      .join('__')
  }

  /**
   * check if reverse link or not.
   * @param {DistanceLink} link - Link.
   * @returns {boolean|boolean} True if reverse link.
   * @public
   */
  isReverseLink(link) {
    return (
      this.sourcePath === link.targetPath && this.targetPath === link.sourcePath
    )
  }
}

export default DistanceLink
