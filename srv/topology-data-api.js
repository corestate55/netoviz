import fs from 'fs'
import TopoGraphConverter from './graph/topo-graph/converter'
import DepGraphConverter from './graph/dependency/converter'
import NestedGraphConverter from './graph/nested/converter'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export default class TopoogyDataAPI {
  constructor (mode) {
    this.timeStampOf = {} // timestamp table
    const prodDistDir = 'dist'
    const devDistDir = 'public'
    const distDir = mode === 'production' ? prodDistDir : devDistDir
    this.modelDir = `${distDir}/model`
    this.cacheDir = prodDistDir // always use prod dist dir for cache
    this.checkCacheDir()
  }

  checkCacheDir () {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir)
    }
  }

  async readCache () {
    console.log('use cache: ', this.cacheJsonPath)
    try {
      return await readFile(this.cacheJsonPath, 'utf8')
    } catch (error) {
      throw error
    }
  }

  async readTopologyDataFromJSON () {
    try {
      return await readFile(this.jsonPath, 'utf8')
    } catch (error) {
      throw error
    }
  }

  writeCache (resJsonString) {
    console.log('create cache: ', this.cacheJsonPath)
    fs.writeFile(this.cacheJsonPath, resJsonString, 'utf8', (error) => {
      if (error) {
        throw error
      }
      console.log(`cache saved: ${this.cacheJsonPath}`)
    })
  }

  updateStatsOfTopoJSON (jsonName) {
    this.jsonPath = `${this.modelDir}/${jsonName}`
    this.cacheJsonPath = `${this.cacheDir}/${jsonName}.cache`
    this.timeStamp = fs.statSync(this.jsonPath)
  }

  foundCache () {
    return this.timeStampOf[this.jsonPath] &&
      this.timeStampOf[this.jsonPath] === this.timeStamp.mtimeMs
  }

  updateCacheTimeStamp () {
    this.timeStampOf[this.jsonPath] = this.timeStamp.mtimeMs
  }

  async convertTopoGraphData (jsonName) {
    this.updateStatsOfTopoJSON(jsonName)
    console.log('Requested: ', this.jsonPath)

    let resJsonString = '' // stringified json (NOT object)
    if (this.foundCache()) {
      resJsonString = await this.readCache()
    } else {
      // the json file was changed.
      this.updateCacheTimeStamp()
      const data = await this.readTopologyDataFromJSON()
      const topoGraphConverter = new TopoGraphConverter(JSON.parse(data))
      resJsonString = JSON.stringify(topoGraphConverter.toData())
      this.writeCache(resJsonString)
    }
    return resJsonString
  }

  async convertDependencyGraphData (jsonName) {
    const topoJsonString = await this.convertTopoGraphData(jsonName)
    const depGraphConverter = new DepGraphConverter(JSON.parse(topoJsonString))
    return JSON.stringify(depGraphConverter.toData())
  }

  async readLayoutJSONOf (jsonName) {
    try {
      const baseName = jsonName.split('.').shift()
      const layoutJsonName = `${this.modelDir}/${baseName}-layout.json`
      return await readFile(layoutJsonName, 'utf-8')
    } catch (error) {
      // layout file is optional.
      // when error (not found the file), use default layout.
      const errorLayoutData = {
        reverse: { error: true },
        standard: { error: true }
      }
      return JSON.stringify(errorLayoutData)
    }
  }

  async convertNestedGraphData (jsonName, reverse) {
    const topoJsonString = await this.convertTopoGraphData(jsonName)
    const layoutJsonString = await this.readLayoutJSONOf(jsonName)
    const nestedGraphConverter = new NestedGraphConverter(
      JSON.parse(topoJsonString), JSON.parse(layoutJsonString), reverse
    )
    return JSON.stringify(nestedGraphConverter.toData())
  }

  async callGraphData (req) {
    const graphName = req.params.graphName
    const jsonName = req.params.jsonName
    try {
      if (graphName === 'topology') {
        return await this.convertTopoGraphData(jsonName)
      } else if (graphName === 'dependency') {
        return await this.convertDependencyGraphData(jsonName)
      } else if (graphName === 'nested') {
        const reverse = req.query.reverse === 'true'
        console.log('call nested: reverse =', reverse)
        return await this.convertNestedGraphData(jsonName, reverse)
      }
    } catch (error) {
      throw error
    }
  }
}
