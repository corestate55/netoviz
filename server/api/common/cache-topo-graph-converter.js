/**
 * @file Wrapper class to use data-cache for topology data converter.
 */

import fs from 'fs'
import { promisify } from 'util'
import toForceSimulationTopologyData from '../../graph/force-simulation'

const readFile = promisify(fs.readFile)

/**
 * RFC8345 Graph data (topology data) converter with data-cache.
 */
class CacheRfcTopologyDataConverter {
  /**
   * @param {string} modelDir - Directory path of model files.
   * @param {string} cacheDir - Directory path to save cache.
   */
  constructor(modelDir, cacheDir) {
    /**
     * timestamp table (json path - timestamp dictionary)
     * @type {Object}
     * @private
     */
    this._timeStampOf = {}
    /**
     * Directory path of model files.
     * @const {string}
     * @private
     */
    this._modelDir = modelDir
    /**
     * Directory path to save cache.
     * @const {string}
     * @private
     */
    this._cacheDir = cacheDir
    this._checkCacheDir()
  }

  /**
   * Check and make cache directory.
   * @private
   */
  _checkCacheDir() {
    if (!fs.existsSync(this._cacheDir)) {
      fs.mkdirSync(this._cacheDir)
    }
  }

  /**
   * Read converted topology data from cache file.
   * @returns {Promise<ForceSimulationTopologyData>} Converted topology data object from cache.
   * @private
   */
  async _readForceSimulationTopologyDataFromCacheJSON() {
    console.log('use cache: ', this._cacheJsonPath)
    const buffer = await readFile(this._cacheJsonPath)
    return JSON.parse(buffer.toString())
  }

  /**
   * Read topology data from file.
   * @returns {Promise<RfcTopologyData>} Topology data object from file.
   * @private
   */
  async _readRfcTopologyDataFromJSON() {
    const buffer = await readFile(this._jsonPath)
    return JSON.parse(buffer.toString())
  }

  /**
   * Write converted topology data to cache file.
   * @param {string} jsonString - Converted topology data as json string.
   * @private
   */
  _writeCache(jsonString) {
    console.log('create cache: ', this._cacheJsonPath)
    fs.writeFile(this._cacheJsonPath, jsonString, 'utf8', error => {
      if (error) {
        throw error
      }
      console.log(`cache saved: ${this._cacheJsonPath}`)
    })
  }

  /**
   * Update target cache file and its timestamp timestamps.
   * @param {string} jsonName - File name of topology data.
   * @private
   */
  _updateStatsOfTopologyJSON(jsonName) {
    /**
     * Target topology data file
     * @type {string}
     * @private
     */
    this._jsonPath = `${this._modelDir}/${jsonName}`
    /**
     * Target cache file of topology data.
     * @type {string}
     * @private
     */
    this._cacheJsonPath = `${this._cacheDir}/${jsonName}.cache`
    /**
     * Timestamp of target topology data file.
     * @type {Stats}
     * @private
     */
    this._timeStamp = fs.statSync(this._jsonPath)
  }

  /**
   * Check cache file existence and target topology file updating.
   * @returns {boolean} True if operative cache exists.
   * @private
   */
  _foundOperativeCache() {
    // if timestamp exists and not equal, then target json file was updated.
    // (Need to convert its data and cache again.)
    return (
      this._timeStampOf[this._jsonPath] &&
      this._timeStampOf[this._jsonPath] === this._timeStamp.mtimeMs
    )
  }

  /**
   * Update timestamp of target topology data when cache create.
   * @private
   */
  _updateCacheTimeStamp() {
    // record timestamp of target json file.
    this._timeStampOf[this._jsonPath] = this._timeStamp.mtimeMs
  }

  /**
   * Convert to data object
   * @param {string} jsonName - File name of topology data.
   * @returns {Promise<ForceSimulationTopologyData>} Converted topology data object.
   * @public
   */
  async toForceSimulationTopologyData(jsonName) {
    this._updateStatsOfTopologyJSON(jsonName)
    console.log('Requested: ', this._jsonPath)

    if (this._foundOperativeCache()) {
      return this._readForceSimulationTopologyDataFromCacheJSON()
    } else {
      // the json file was changed.
      this._updateCacheTimeStamp()
      const rfcTopologyData = await this._readRfcTopologyDataFromJSON()
      const topologyData = await toForceSimulationTopologyData(rfcTopologyData)
      this._writeCache(JSON.stringify(topologyData))
      return topologyData
    }
  }
}

export default CacheRfcTopologyDataConverter
