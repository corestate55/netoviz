/**
 * @file Wrapper class to use data-cache for topology data converter.
 */

import fs from 'fs'
import { promisify } from 'util'
import toForceSimulationTopologyData from '../../graph/force-simulation'

const readFile = promisify(fs.readFile)
const statFile = promisify(fs.stat)

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
    try {
      const buffer = await readFile(this._cacheJsonPath)
      return JSON.parse(buffer.toString())
    } catch (error) {
      // this function is called after checking operative cache existence (_foundOperativeCache())
      // exception in readFile() for cache json means error in json (contents).
      console.error('Error: cannot read cache: ', this._cacheJsonPath)
      fs.unlink(this._cacheJsonPath, (error) => {
        if (error) {
          throw error
        }
        console.warn(
          `Warning: server removes cache ${this._cacheJsonPath}. Retry request again.`
        )
      })
      throw error
    }
  }

  /**
   * Read topology data from file.
   * @returns {Promise<RfcTopologyData>} Topology data object from file.
   * @private
   */
  async _readRfcTopologyDataFromJSON() {
    try {
      const buffer = await readFile(this._jsonPath)
      return JSON.parse(buffer.toString())
    } catch (error) {
      console.error('Error: cannot read model file: ', this._jsonPath)
      throw error
    }
  }

  /**
   * Write converted topology data to cache file.
   * @param {string} jsonString - Converted topology data as json string.
   * @private
   */
  _writeCache(jsonString) {
    console.log('create cache: ', this._cacheJsonPath)
    fs.writeFile(this._cacheJsonPath, jsonString, 'utf8', (error) => {
      if (error) {
        console.error('Error: cannot write cache file: ', this._cacheJsonPath)
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
  async _updateStatsOfTopologyJSON(jsonName) {
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

    try {
      /**
       * Timestamp of target topology data file.
       * @type {Stats|null}
       * @private
       */
      this._targetStats = await statFile(this._jsonPath)
    } catch (error) {
      console.error('Error: Cannot stat topology data file: ', this._jsonPath)
      this._targetStats = null
      throw error
    }

    try {
      /**
       * Timestamp of cache file.
       * @type {Stats|null}
       * @private
       */
      this._cacheStats = await statFile(this._cacheJsonPath)
    } catch (error) {
      console.warn('Warning: cannot stat cache file: ', this._cacheJsonPath)
      this._cacheStats = null
    }
  }

  /**
   * Check cache file existence and target topology file updating.
   * @param {string} jsonName - File name of topology data.
   * @returns {boolean} True if operative cache exists.
   * @private
   */
  async _foundOperativeCache(jsonName) {
    await this._updateStatsOfTopologyJSON(jsonName)
    console.log('Requested: ', this._jsonPath)
    return (
      this._targetStats &&
      this._cacheStats &&
      this._targetStats.mtimeMs < this._cacheStats.mtimeMs
    )
  }

  /**
   * Read topology data, conver it to force-simulation data and save it as cache.
   * @returns {Promise<ForceSimulationTopologyData>} Converted topology data object.
   * @private
   */
  async _readForceSimulationTopologyDataAndWriteCache() {
    const rfcTopologyData = await this._readRfcTopologyDataFromJSON()
    const topologyData = await toForceSimulationTopologyData(rfcTopologyData)
    this._writeCache(JSON.stringify(topologyData))
    return topologyData
  }

  /**
   * Convert to data object
   * @param {string} jsonName - File name of topology data.
   * @returns {Promise<ForceSimulationTopologyData>} Converted topology data object.
   * @public
   */
  async toForceSimulationTopologyData(jsonName) {
    if (await this._foundOperativeCache(jsonName)) {
      return this._readForceSimulationTopologyDataFromCacheJSON()
    } else {
      return await this._readForceSimulationTopologyDataAndWriteCache()
    }
  }
}

export default CacheRfcTopologyDataConverter
