import fs from 'fs'
import Graphs from './graph/graphs'
import DepGraphConverter from './dep-graph-converter'
import NestedGraphConverter from './nested-graph-converter'
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
    return readFile(this.cacheJsonPath, 'utf8')
  }

  async readTopologyDataFromJSON () {
    try {
      const data = await readFile(this.jsonPath, 'utf8')
      const topoData = JSON.parse(data)
      const graphs = new Graphs(topoData)
      return JSON.stringify(graphs.graphs)
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

  updateStatsOfTopoJSON (req) {
    this.jsonName = req.params.jsonName
    this.jsonPath = `${this.modelDir}/${this.jsonName}`
    this.cacheJsonPath = `${this.cacheDir}/${this.jsonName}.cache`
    this.timeStamp = fs.statSync(this.jsonPath)
  }

  foundCache () {
    return this.timeStampOf[this.jsonPath] &&
      this.timeStampOf[this.jsonPath] === this.timeStamp.mtimeMs
  }

  updateCacheTimeStamp () {
    this.timeStampOf[this.jsonPath] = this.timeStamp.mtimeMs
  }

  async convertTopoGraphData (req) {
    this.updateStatsOfTopoJSON(req)
    console.log('Requested: ', this.jsonPath)

    let resJsonString = '' // stringified json (NOT object)
    if (this.foundCache()) {
      resJsonString = await this.readCache()
    } else {
      // the json file was changed.
      this.updateCacheTimeStamp()
      resJsonString = await this.readTopologyDataFromJSON()
      this.writeCache(resJsonString)
    }
    return resJsonString
  }

  async convertDependencyGraphData (req) {
    const topoJsonString = await this.convertTopoGraphData(req)
    const depGraphConverter = new DepGraphConverter(JSON.parse(topoJsonString))
    return JSON.stringify(depGraphConverter.toData())
  }

  async convertNestedGraphData (req) {
    const topoJsonString = await this.convertTopoGraphData(req)
    const nestedGraphConverter = new NestedGraphConverter(JSON.parse(topoJsonString))
    return JSON.stringify(nestedGraphConverter.toData())
  }
}
