/**
 * @file API implementation of netoviz HTTP server.
 */

/**
 * Express (web framework) HTTP Request.
 * @typedef {Object} Request
 * @prop {Object} query - Dictionary of HTTP GET parameters (key-value).
 * @prop {Object} params - Dictionary of named route parameters (key-value).
 *     @see {@link server/api/rest/index.js}
 */

import fs from 'fs'
import { promisify } from 'util'
import _toDependencyTopologyData from '../../graph/dependency'
import _toNestedTopologyData from '../../graph/nested'
import _toDistanceTopologyData from '../../graph/distance'
import APIBase from '../common/api-base'
import { splitAlertHost } from '../common/alert-util'

const asyncReadFile = promisify(fs.readFile)

/**
 * Class of API for topology data converter.
 * @extends {APIBase}
 */
class RESTIntegrator extends APIBase {
  /**
   * Convert boolean string ('true', 'false') to value (`true`/`false`).
   * @param {string} strBool - String of a boolean value.
   * @returns {boolean} Boolean value.
   * @private
   */
  _boolString2Bool(strBool) {
    if (!strBool) {
      return false
    }
    return strBool.toLowerCase() === 'true'
  }

  /**
   * Convert integer string to integer value.
   * @param {string} strNum - Strong of a integer value.
   * @returns {number} Integer value.
   * @private
   */
  _numberString2Number(strNum) {
    if (!strNum) {
      return 1
    }
    return Number(strNum)
  }

  /**
   * Print graph query (logging)
   * @param {string} graphType - Type of graph (topology, dependency, nested)
   * @param {GraphQuery} graphQuery - Dictionary of get parameters.
   * @private
   */
  _printGraphQuery(graphType, graphQuery) {
    const paramStrings = []
    Object.entries(/** @type {Object} */ graphQuery).forEach(
      ([k, v]) => v && paramStrings.push(`${k}=${v}`)
    )
    console.log(`call ${graphType}: ${paramStrings.join(', ')}`)
  }

  /**
   * Construct graph query string (GET parameter of URI).
   * @param {string} graphType - Type of graph (topology, dependency, nested)
   * @param {Object} query - HTTP get parameter (key-value)
   * @param {Array<Array<string>>} keys - Array of [key, type] for query.
   * @returns {GraphQuery} Dictionary of get parameters.
   * @private
   */
  _makeGraphQuery(graphType, query, keys) {
    /**
     * Key-value dictionary of server query.
     * @typedef {NestedGraphQuery|DependencyGraphQuery} GraphQuery
     */
    const graphQuery = {}
    for (const [key, keyType] of keys) {
      if (keyType === 'number') {
        graphQuery[key] = this._numberString2Number(query[key])
      } else if (keyType === 'bool') {
        graphQuery[key] = this._boolString2Bool(query[key])
      } else {
        // string
        graphQuery[key] = query[key]
      }
    }
    // 'alertHost' overwrite 'target'/'layer' parameter.
    // value format: 'target', 'layer__target' ('layer_target_tp')
    if (graphQuery.alertHost) {
      const alert = splitAlertHost(graphQuery.alertHost)
      graphQuery.target = alert.host
      graphQuery.layer = alert.layer
      delete graphQuery.alertHost
    }
    this._printGraphQuery(graphType, graphQuery)
    return graphQuery
  }

  /**
   * @override
   */
  async toDependencyTopologyData(jsonName, req) {
    const queryKeyTypeList = [
      ['target', 'string'],
      ['layer', 'string'],
      ['alertHost', 'string']
    ]
    const graphQuery = /** @type {DependencyGraphQuery} */ this._makeGraphQuery(
      'dependency',
      req.query,
      queryKeyTypeList
    )
    graphQuery.topologyData = await this.toForceSimulationTopologyData(jsonName)
    return _toDependencyTopologyData(graphQuery)
  }

  /**
   * @override
   */
  async toNestedTopologyData(jsonName, req) {
    const queryKeyTypeList = [
      ['reverse', 'bool'],
      ['depth', 'number'],
      ['target', 'string'],
      ['layer', 'string'],
      ['alertHost', 'string'],
      ['aggregate', 'bool']
    ]
    const graphQuery = /** @type {NestedGraphQuery} */ this._makeGraphQuery(
      'nested',
      req.query,
      queryKeyTypeList
    )
    graphQuery.topologyData = await this.toForceSimulationTopologyData(jsonName)
    graphQuery.layoutData = await this.readLayoutJSON(jsonName)
    return _toNestedTopologyData(graphQuery)
  }

  /**
   * @override
   */
  async toDistanceTopologyData(jsonName, req) {
    const queryKeyTypeList = [
      ['target', 'string'],
      ['layer', 'string'],
      ['alertHost', 'string']
    ]
    const graphQuery = /** @type {DistanceGraphQuery} */ this._makeGraphQuery(
      'distance',
      req.query,
      queryKeyTypeList
    )
    graphQuery.topologyData = await this.toForceSimulationTopologyData(jsonName)
    return _toDistanceTopologyData(graphQuery)
  }

  /**
   * Receive graph layout data and save it to layout-file.
   * @param {Request} req - HTTP request.
   * @returns {Promise<void>}
   * @public
   */
  async postGraphData(req) {
    const layoutData = req.body
    const graphName = req.params.graphName // TODO: 404 if graphName != nested
    const jsonName = req.params.jsonName
    const reverse = this._boolString2Bool(req.query.reverse)

    console.log(
      `receive ${graphName}/${jsonName}?reverse=${reverse}): `,
      layoutData
    )

    const layoutJsonName = `${jsonName.split('.').shift()}-layout.json`
    const layoutJsonPath = `${this.modelDir}/${layoutJsonName}`
    const cacheLayoutJsonPath = layoutJsonPath // overwrite

    const buffer = await asyncReadFile(layoutJsonPath)
    const baseLayoutData = JSON.parse(buffer.toString())
    const reverseKey = reverse ? 'reverse' : 'standard'
    baseLayoutData[reverseKey].grid = layoutData
    const layoutDataString = JSON.stringify(baseLayoutData, null, 2) // pretty print
    fs.writeFile(cacheLayoutJsonPath, layoutDataString, 'utf8', (error) => {
      if (error) {
        throw error
      }
      console.log(`layout cache saved: ${cacheLayoutJsonPath}`)
    })
  }
}

export default RESTIntegrator
