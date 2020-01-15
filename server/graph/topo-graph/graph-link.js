'use strict'
/**
 * @file Definition of link class for topology diagram.
 */

/**
 * Link for topology diagram.
 */
class TopologyGraphLink {
  /**
   * @typedef {Object} LinkData
   * @prop {string} name
   * @prop {string} path
   * @prop {string} type
   * @prop {string} sourcePath
   * @prop {string} targetPath
   * @prop {number} sourceId
   * @prop {number} targetId
   * @prop {Object} attribute
   * @prop {DiffState} diffState
   */
  /**
   * @typedef {LinkData|TopologyGraphLink} TopologyGraphLinkData
   */
  /**
   * @param {LinkData} linkData
   */
  constructor(linkData) {
    /** @type {string} */
    this.name = linkData.name
    /** @type {string} */
    this.path = linkData.path
    /** @type {string} */
    this.type = linkData.type
    /** @type {string} */
    this.sourcePath = linkData.sourcePath
    /** @type {string} */
    this.targetPath = linkData.targetPath
    // Link termination point ID (0 means error...)
    /** @type {number} */
    this.sourceId = linkData.sourceId || 0
    /** @type {number} */
    this.targetId = linkData.targetId || 0
    /** @type {Object} */
    this.attribute = linkData.attribute || {}
    /** @type {DiffState} */
    this.diffState = linkData.diffState || {}
  }
}

export default TopologyGraphLink
