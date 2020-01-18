'use strict'
/**
 * @file Definition of link class for topology diagram.
 */

/**
 * Link for topology diagram.
 */
class ForceSimulationLink {
  /**
   * @typedef {Object} LinkData
   * @prop {string} name - Name of link.
   * @prop {string} path - Path of link.
   * @prop {string} type - Type of link.
   * @prop {string} sourcePath - Path of source term-point.
   * @prop {string} targetPath - Path of destination term-point.
   * @prop {number} sourceId - ID of source term-point. (for force-simulation diagram)
   * @prop {number} targetId - ID of destination term-point (for force-simulation diagram)
   * @prop {Object} attribute - Attribute of link.
   * @prop {DiffState} diffState - State of diff.
   */
  /**
   * @typedef {LinkData|ForceSimulationLink} ForceSimulationLinkData
   */
  /**
   * @param {ForceSimulationLinkData} linkData - Link data.
   *     (in inherited class,
   *     it will be {@link LinkData} or {@link ForceSimulationLink}.)
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

export default ForceSimulationLink
