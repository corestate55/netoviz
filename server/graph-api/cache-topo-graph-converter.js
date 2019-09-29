import fs from 'fs'
import { promisify } from 'util'
import convertTopologyGraphData from '../graph/topo-graph/converter'

const readFile = promisify(fs.readFile)

export default class CacheTopologyGraphConverter {
  constructor(modelDir, cacheDir) {
    this.timeStampOf = {} // timestamp table
    this.modelDir = modelDir
    this.cacheDir = cacheDir
    this.checkCacheDir()
  }

  checkCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir)
    }
  }

  async readTopologyDataFromCacheJSON() {
    console.log('use cache: ', this.cacheJsonPath)
    const jsonString = await readFile(this.cacheJsonPath, 'utf8')
    return JSON.parse(jsonString)
  }

  async readTopologyDataFromJSON() {
    const jsonString = await readFile(this.jsonPath, 'utf8')
    return JSON.parse(jsonString)
  }

  writeCache(jsonString) {
    console.log('create cache: ', this.cacheJsonPath)
    fs.writeFile(this.cacheJsonPath, jsonString, 'utf8', error => {
      if (error) {
        throw error
      }
      console.log(`cache saved: ${this.cacheJsonPath}`)
    })
  }

  updateStatsOfTopoJSON(jsonName) {
    this.jsonPath = `${this.modelDir}/${jsonName}`
    this.cacheJsonPath = `${this.cacheDir}/${jsonName}.cache`
    this.timeStamp = fs.statSync(this.jsonPath)
  }

  foundCache() {
    return (
      this.timeStampOf[this.jsonPath] &&
      this.timeStampOf[this.jsonPath] === this.timeStamp.mtimeMs
    )
  }

  updateCacheTimeStamp() {
    this.timeStampOf[this.jsonPath] = this.timeStamp.mtimeMs
  }

  async toData(jsonName) {
    this.updateStatsOfTopoJSON(jsonName)
    console.log('Requested: ', this.jsonPath)

    if (this.foundCache()) {
      return this.readTopologyDataFromCacheJSON()
    } else {
      // the json file was changed.
      this.updateCacheTimeStamp()
      const graphDataFromJSON = await this.readTopologyDataFromJSON()
      const graphData = await convertTopologyGraphData(graphDataFromJSON)
      this.writeCache(JSON.stringify(graphData))
      return graphData
    }
  }
}
