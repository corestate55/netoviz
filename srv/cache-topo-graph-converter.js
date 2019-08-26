import convertTopologyGraphData from './graph/topo-graph/converter'
import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export default class CacheTopologyGraphConverter {
  constructor (modelDir, cacheDir) {
    this.timeStampOf = {} // timestamp table
    this.modelDir = modelDir
    this.cacheDir = cacheDir
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
    fs.writeFile(this.cacheJsonPath, resJsonString, 'utf8', error => {
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
    return (
      this.timeStampOf[this.jsonPath] &&
      this.timeStampOf[this.jsonPath] === this.timeStamp.mtimeMs
    )
  }

  updateCacheTimeStamp () {
    this.timeStampOf[this.jsonPath] = this.timeStamp.mtimeMs
  }

  async toData (jsonName) {
    let resJsonString = '' // stringified json (NOT object)
    try {
      this.updateStatsOfTopoJSON(jsonName)
      console.log('Requested: ', this.jsonPath)

      if (this.foundCache()) {
        resJsonString = await this.readCache()
      } else {
        // the json file was changed.
        this.updateCacheTimeStamp()
        resJsonString = await convertTopologyGraphData(async () =>
          this.readTopologyDataFromJSON()
        )
        this.writeCache(resJsonString)
      }
    } catch (error) {
      resJsonString = ''
      console.log('return null because error found in convertTopoGraphData()')
      console.log(error)
    }
    return resJsonString
  }
}
